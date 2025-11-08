# Configuración Inicial del Sistema CITAPP

## Paso 1: Crear el Usuario Administrador

Para crear el usuario administrador de prueba, sigue estos pasos:

### Opción A: Desde la Consola de Supabase (Recomendado)

1. Ve a tu proyecto en [https://supabase.com](https://supabase.com)
2. Navega a **Authentication** > **Users**
3. Haz clic en **Add user** > **Create new user**
4. Ingresa los siguientes datos:
   - **Email**: `admin@citapp.com`
   - **Password**: `admin123`
   - **Auto Confirm User**: ✅ (activado)
5. Haz clic en **Create user**

6. Una vez creado el usuario, ejecuta el siguiente SQL en el **SQL Editor**:

```sql
-- Insertar el usuario en la tabla usuarios
INSERT INTO usuarios (id, rol, nombre, apellidos, email, activo)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@citapp.com' LIMIT 1),
  'admin',
  'Administrador',
  'CITAPP',
  'admin@citapp.com',
  true
)
ON CONFLICT (id) DO UPDATE SET
  rol = 'admin',
  nombre = 'Administrador',
  apellidos = 'CITAPP',
  activo = true;
```

### Opción B: Usando la Aplicación

1. Ejecuta la aplicación con `npm run dev`
2. Haz clic en **Mi perfil** en la esquina superior derecha
3. Intenta iniciar sesión (esto abrirá la pantalla de login)
4. Usa las credenciales de prueba si ya creaste el usuario en Supabase

## Paso 2: Verificar la Instalación

1. Abre la aplicación en tu navegador
2. Deberías ver la vista de productos sin necesidad de iniciar sesión
3. Haz clic en **Mi perfil** para acceder al login de administrador
4. Ingresa las credenciales:
   - Email: `admin@citapp.com`
   - Contraseña: `admin123`
5. Verifica que puedes acceder al dashboard y todas las funcionalidades de administrador

## Paso 3: Probar Funcionalidades

### Como Empleado (Sin login)
- ✅ Ver lista de productos
- ✅ Buscar productos
- ✅ Ver detalles de productos
- ✅ Escanear códigos QR (ingreso manual)

### Como Administrador (Con login)
- ✅ Acceder al dashboard
- ✅ Gestionar productos (crear, editar, eliminar)
- ✅ Generar códigos QR
- ✅ Gestionar administradores
- ✅ Ver reportes y métricas
- ✅ Cambiar contraseña

## Paso 4: Datos de Prueba

El sistema ya incluye:
- ✅ 4 categorías de productos
- ✅ 4 ubicaciones de almacén
- ✅ 6 productos de ejemplo

## Solución de Problemas

### Error: "Usuario no encontrado en la tabla usuarios"

Esto significa que el usuario fue creado en Auth pero no en la tabla usuarios. Ejecuta el SQL del Paso 1 para crear el registro.

### Error: "Invalid login credentials"

Verifica que:
1. El usuario fue creado en Supabase Auth
2. El email y contraseña son correctos
3. El usuario fue confirmado (Auto Confirm activado)

### Error: "No se puede acceder a funciones de administrador"

Verifica que:
1. El usuario tiene rol 'admin' en la tabla usuarios
2. El campo 'activo' está en true
3. Las políticas RLS están configuradas correctamente

## Seguridad en Producción

**IMPORTANTE**: Antes de poner el sistema en producción:

1. Cambia la contraseña del administrador por defecto
2. Crea administradores con correos corporativos reales
3. Desactiva el usuario admin@citapp.com
4. Configura reglas de contraseña más estrictas
5. Habilita autenticación de dos factores si es posible
6. Revisa y ajusta las políticas RLS según tus necesidades

## Soporte

Si encuentras problemas durante la configuración, revisa:
- Los logs de la consola del navegador (F12)
- Los logs de Supabase en el panel de administración
- Las políticas RLS en la sección de Database

---

**Sistema desarrollado para**: UTEZ - División de Tecnologías de la Información y Diseño
