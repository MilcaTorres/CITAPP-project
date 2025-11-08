# CITAPP - Control de Inventario con Tecnología de Aplicación

Sistema web profesional para la gestión automatizada de inventario mediante códigos QR únicos por producto.

## Características Principales

- **Gestión de Productos**: CRUD completo con generación automática de códigos QR
- **Escaneo QR**: Verificación rápida de productos mediante códigos QR
- **Control de Movimientos**: Registro automático de entradas, salidas y verificaciones
- **Gestión de Administradores**: Control de acceso basado en roles
- **Dashboard Analítico**: Métricas visuales del inventario
- **Arquitectura SOA**: Módulos independientes y escalables
- **Responsive Design**: Optimizado para PC, tablet y móvil

## Roles del Sistema

### Empleado
- **No requiere autenticación** para funciones básicas
- Puede consultar productos sin iniciar sesión
- Puede escanear códigos QR
- Puede buscar y verificar inventario

### Administrador
- **Requiere autenticación** para acceder al sistema completo
- Gestión completa de productos (crear, editar, eliminar)
- Generación y exportación de códigos QR
- Actualización de stock y registro de movimientos
- Gestión de otros administradores
- Acceso a reportes y métricas

## Credenciales de Prueba

### Administrador Principal
```
Correo: admin@citapp.com
Contraseña: admin123
```

**IMPORTANTE**:
- El usuario administrador debe ser creado manualmente en Supabase Auth la primera vez
- Consulta el archivo `SETUP.md` para instrucciones detalladas de configuración
- Se recomienda cambiar estas credenciales en producción por motivos de seguridad

## Tecnologías Utilizadas

- **Frontend**: React.js + TypeScript + Vite
- **Estilos**: Tailwind CSS
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Iconos**: Lucide React
- **QR Codes**: API de QR Server

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno (`.env`):
```
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anon_de_supabase
```

4. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

5. Compilar para producción:
```bash
npm run build
```

## Estructura de Base de Datos

### Tablas Principales

- **productos**: Información de productos con campos clave, nombre, marca, tipo, cantidad, clasificación, ubicación y QR
- **categorias**: Clasificación de productos
- **ubicaciones**: Ubicaciones físicas del almacén (pasillo, nivel, sección)
- **usuarios**: Administradores del sistema con roles y permisos
- **movimientos**: Histórico de entradas, salidas y verificaciones
- **verificaciones_inventario**: Registro de auditorías físicas vs sistema

### Seguridad

- Row Level Security (RLS) habilitado en todas las tablas
- Políticas restrictivas basadas en roles
- Acceso público de lectura para empleados
- Acceso completo para administradores autenticados

## Uso del Sistema

### Para Empleados (Sin Autenticación)

1. Acceder a la aplicación directamente
2. Vista de productos disponible inmediatamente
3. Buscar productos por nombre, clave o marca
4. Escanear códigos QR para verificar productos
5. Consultar información detallada de productos

### Para Administradores

1. Hacer clic en "Mi perfil" en la esquina superior derecha
2. Iniciar sesión con credenciales de administrador
3. Acceder al dashboard principal con métricas
4. Gestionar productos desde el menú lateral
5. Administrar otros usuarios desde la sección de administradores
6. Ver y generar reportes de inventario

## Funcionalidades Destacadas

### Generación de Códigos QR
- QR único por producto generado automáticamente
- Contiene información del producto codificada en JSON
- Exportable y descargable para impresión

### Gestión de Inventario
- Actualización en tiempo real del stock
- Registro automático de movimientos
- Alertas visuales para productos con bajo stock
- Clasificación de productos (frágil/no frágil)

### Verificación de Inventario
- Escaneo rápido mediante código QR
- Comparación automática entre stock físico y sistema
- Registro de discrepancias
- Historial completo de verificaciones

## Arquitectura

El sistema sigue una arquitectura orientada a servicios (SOA) con:

- **Frontend React**: Interfaz de usuario interactiva
- **Supabase Backend**: Base de datos PostgreSQL con API REST automática
- **Autenticación**: Sistema de roles con Supabase Auth
- **Módulos Independientes**: Productos, Usuarios, Movimientos, Reportes

## Requerimientos No Funcionales

- ✅ Operaciones rápidas (< 2 segundos)
- ✅ Alta disponibilidad (99%)
- ✅ Interfaz intuitiva y accesible
- ✅ Seguridad con roles y RLS
- ✅ Escalabilidad para nuevos módulos
- ✅ Integridad y respaldo de datos
- ✅ Diseño responsive

## Soporte

Para soporte técnico o consultas, contactar al equipo de desarrollo.

---

**Desarrollado para**: Universidad Tecnológica Emiliano Zapata del Estado de Morelos
**División**: Tecnologías de la Información y Diseño
**Proyecto**: Integrador - Arquitecturas de Software
