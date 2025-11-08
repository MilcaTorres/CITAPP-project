# Arquitectura del Sistema CITAPP

## Visión General

CITAPP implementa una **Arquitectura Orientada a Servicios (SOA)** con módulos independientes que se comunican a través de APIs REST proporcionadas por Supabase.

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│                  (React + Vite)                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │   Productos  │  │  Usuarios    │  │  Reportes │ │
│  │   Module     │  │  Module      │  │  Module   │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ Movimientos  │  │ Verificación │  │    Auth   │ │
│  │   Module     │  │   Module     │  │  Module   │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
│                                                      │
└──────────────────────┬──────────────────────────────┘
                       │
                       │ REST API / Realtime
                       │
┌──────────────────────▼──────────────────────────────┐
│                  SUPABASE                            │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │
│  │  PostgreSQL │  │ Supabase    │  │  Storage   │  │
│  │  Database   │  │    Auth     │  │            │  │
│  └─────────────┘  └─────────────┘  └────────────┘  │
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │         Row Level Security (RLS)             │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## Capas de la Aplicación

### 1. Capa de Presentación (Frontend)

**Tecnologías**: React 18, TypeScript, Tailwind CSS, Vite

#### Componentes Principales

- **Layout Components**
  - `Header`: Barra superior con título y acceso a perfil
  - `Sidebar`: Navegación lateral con iconos

- **Feature Modules**
  - `Products`: Gestión completa de productos con QR
  - `Administrators`: CRUD de administradores
  - `Dashboard`: Métricas y estadísticas
  - `Profile`: Gestión de perfil y contraseña
  - `Auth`: Autenticación de administradores

#### Contextos
- `AuthContext`: Gestión de estado de autenticación global

#### Utilidades
- `qrcode.ts`: Generación de códigos QR
- `supabase.ts`: Cliente de Supabase

### 2. Capa de Servicios (API)

**Proveedor**: Supabase REST API + Realtime

- Auto-generación de endpoints REST por tabla
- Suscripciones en tiempo real
- Autenticación JWT
- Políticas de seguridad a nivel de fila (RLS)

### 3. Capa de Datos (Database)

**Tecnología**: PostgreSQL (Supabase)

#### Modelo de Datos

```
productos
├─ id (UUID, PK)
├─ clave (TEXT, UNIQUE)
├─ nombre (TEXT)
├─ marca (TEXT)
├─ tipo (TEXT)
├─ cantidad (INTEGER)
├─ clasificacion (TEXT)
├─ categoria_id (UUID, FK)
├─ ubicacion_id (UUID, FK)
├─ qr_url (TEXT)
└─ timestamps

categorias
├─ id (UUID, PK)
├─ nombre (TEXT, UNIQUE)
├─ descripcion (TEXT)
└─ created_at

ubicaciones
├─ id (UUID, PK)
├─ codigo (TEXT, UNIQUE)
├─ pasillo (TEXT)
├─ nivel (TEXT)
├─ seccion (TEXT)
└─ created_at

usuarios
├─ id (UUID, PK, FK -> auth.users)
├─ rol (TEXT)
├─ nombre (TEXT)
├─ apellidos (TEXT)
├─ email (TEXT, UNIQUE)
├─ activo (BOOLEAN)
└─ created_at

movimientos
├─ id (UUID, PK)
├─ producto_id (UUID, FK)
├─ usuario_id (UUID, FK)
├─ tipo (TEXT)
├─ cantidad (INTEGER)
├─ observaciones (TEXT)
├─ fecha (TIMESTAMPTZ)
└─ created_at

verificaciones_inventario
├─ id (UUID, PK)
├─ producto_id (UUID, FK)
├─ cantidad_sistema (INTEGER)
├─ cantidad_fisica (INTEGER)
├─ coincide (BOOLEAN)
├─ observaciones (TEXT)
├─ fecha (TIMESTAMPTZ)
└─ created_at
```

## Seguridad

### Row Level Security (RLS)

Todas las tablas implementan políticas RLS:

#### Productos, Categorías, Ubicaciones
- **SELECT**: Acceso público (empleados sin login)
- **INSERT/UPDATE/DELETE**: Solo administradores autenticados

#### Usuarios
- **SELECT**: Solo administradores + propio perfil
- **INSERT/UPDATE**: Solo administradores
- **DELETE**: Deshabilitado

#### Movimientos y Verificaciones
- **SELECT**: Acceso público
- **INSERT**: Usuarios autenticados

### Autenticación

- **JWT Tokens**: Proporcionados por Supabase Auth
- **Session Management**: Manejo automático de sesiones
- **Password Hashing**: bcrypt (manejado por Supabase)

## Flujos Principales

### 1. Flujo de Empleado (Sin Autenticación)

```
Usuario → Aplicación → Vista Productos
              ↓
         Consultar BD (Supabase)
              ↓
         Mostrar Productos
              ↓
    Escanear QR / Buscar
              ↓
      Ver Detalles Producto
```

### 2. Flujo de Administrador (Con Autenticación)

```
Admin → Login → Supabase Auth
          ↓
    Verificación JWT
          ↓
    Cargar Usuario desde BD
          ↓
    Dashboard / Gestión
          ↓
   CRUD Productos/Usuarios
          ↓
    Actualizar BD (RLS Check)
```

### 3. Flujo de Generación de QR

```
Admin → Seleccionar Producto
          ↓
    Generar Datos QR (JSON)
          ↓
    API QR Server
          ↓
    Guardar URL en BD
          ↓
    Mostrar/Descargar QR
```

## Patrones de Diseño Implementados

### 1. **Service-Oriented Architecture (SOA)**
- Módulos independientes y escalables
- Comunicación mediante API REST
- Separación de responsabilidades

### 2. **Repository Pattern**
- Supabase actúa como capa de abstracción de datos
- Consultas centralizadas y reutilizables

### 3. **Provider Pattern (React Context)**
- `AuthContext` para estado global de autenticación
- Evita prop drilling

### 4. **Component Composition**
- Componentes reutilizables y modulares
- Separación entre presentación y lógica

### 5. **Role-Based Access Control (RBAC)**
- Roles definidos: admin, empleado
- Permisos a nivel de componente y base de datos

## Escalabilidad

### Horizontal
- Frontend puede ser desplegado en múltiples servidores
- Supabase escala automáticamente

### Vertical
- Módulos independientes pueden crecer sin afectar otros
- Fácil agregar nuevos módulos (Reportes, Analytics, etc.)

### Nuevos Módulos Potenciales
- **Módulo de Reportes**: Exportación PDF/Excel
- **Módulo de Notificaciones**: Email/SMS automáticos
- **Módulo de Analytics**: Gráficos y estadísticas avanzadas
- **Módulo de Proveedores**: Gestión de compras
- **Módulo de Alertas**: Stock mínimo, caducidad, etc.

## Performance

### Optimizaciones Implementadas
- Lazy loading de componentes
- Índices en columnas frecuentemente consultadas
- Queries optimizadas con JOINs selectivos
- Caching de sesión en cliente

### Métricas Objetivo
- Tiempo de respuesta: < 2 segundos
- Disponibilidad: 99%
- Concurrencia: 100+ usuarios simultáneos

## Despliegue

### Recomendaciones
- **Frontend**: Vercel, Netlify, o servidor estático
- **Backend**: Supabase (managed)
- **CDN**: Para assets estáticos
- **Monitoring**: Sentry para errores, Analytics para uso

## Mantenibilidad

### Buenas Prácticas Implementadas
- TypeScript para type safety
- Componentes modulares y reutilizables
- Nombres descriptivos y consistentes
- Separación de lógica de negocio
- Migrations versionadas para BD

### Testing Recomendado
- Unit tests: Jest + React Testing Library
- Integration tests: Cypress
- E2E tests: Playwright

---

**Arquitectura diseñada para**: UTEZ - Proyecto Integrador 7°B IDGS
