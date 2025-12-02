# 🔧 Solución: Usuario OAuth no se crea en tabla usuarios

## 📋 Diagnóstico del Problema

**Error actual**: "Usuario autenticado pero no encontrado en tabla usuarios después de reintentos"

**Causa raíz**: El trigger `on_auth_user_created` no se está ejecutando correctamente cuando un usuario se autentica con Google OAuth.

## ✅ Solución Paso a Paso

### Paso 1: Ejecutar Script de Corrección en Supabase

1. **Abrir Supabase Dashboard**:

   - Ve a [https://app.supabase.com/](https://app.supabase.com/)
   - Selecciona tu proyecto CITAPP

2. **Abrir SQL Editor**:

   - En el menú lateral, click en **SQL Editor**
   - Click en **New query**

3. **Copiar y Ejecutar el Script**:

   - Abre el archivo [`FIX_TRIGGER_SUPABASE.sql`](file:///home/chris/Github/CITAPP-project/FIX_TRIGGER_SUPABASE.sql)
   - Copia **TODO** el contenido
   - Pégalo en el SQL Editor de Supabase
   - Click en **Run** (o presiona Ctrl+Enter)

4. **Verificar Resultado**:
   - Deberías ver un mensaje de éxito
   - En la sección de resultados, deberías ver una fila que confirma que el trigger `on_auth_user_created` existe

### Paso 2: Limpiar Usuarios OAuth Existentes (Opcional)

Si ya intentaste hacer login con Google y quedaron usuarios "huérfanos" en `auth.users` sin registro en `usuarios`:

1. **Verificar usuarios huérfanos**:

   ```sql
   SELECT
     au.id,
     au.email,
     au.raw_user_meta_data->>'full_name' as nombre_google,
     u.id as usuario_id
   FROM auth.users au
   LEFT JOIN public.usuarios u ON au.id = u.id
   WHERE u.id IS NULL;
   ```

2. **Si hay usuarios huérfanos, crearlos manualmente**:
   ```sql
   INSERT INTO public.usuarios (id, rol, nombre, apellidos, email, activo)
   SELECT
     au.id,
     'admin' as rol,
     SPLIT_PART(COALESCE(au.raw_user_meta_data->>'full_name', 'Usuario'), ' ', 1) as nombre,
     TRIM(SUBSTRING(COALESCE(au.raw_user_meta_data->>'full_name', '') FROM LENGTH(SPLIT_PART(COALESCE(au.raw_user_meta_data->>'full_name', 'Usuario'), ' ', 1)) + 2)) as apellidos,
     au.email,
     true as activo
   FROM auth.users au
   LEFT JOIN public.usuarios u ON au.id = u.id
   WHERE u.id IS NULL
     AND (au.raw_user_meta_data->>'provider' IS NOT NULL
          OR au.raw_user_meta_data->>'full_name' IS NOT NULL);
   ```

### Paso 3: Probar Login con Google

1. **Cerrar todas las sesiones**:

   - En tu aplicación, cierra sesión si estás logueado
   - Cierra todas las pestañas de la aplicación
   - Opcional: Limpia cookies del navegador

2. **Intentar login con Google**:

   - Ve a http://localhost:5173/login
   - Click en "Continuar con Google"
   - Selecciona tu cuenta de Google
   - Acepta permisos

3. **Verificar en consola del navegador** (F12):

   - Deberías ver el mensaje: `Usuario creado: tu-email@gmail.com (OAuth: true, Activo: true)`
   - NO deberías ver el error "Usuario autenticado pero no encontrado"
   - Deberías ser redirigido a `/dashboard`

4. **Verificar en base de datos**:
   ```sql
   SELECT * FROM public.usuarios
   WHERE email = 'tu-email@gmail.com';
   ```
   - Deberías ver tu usuario con `activo = true`

## 🔍 Verificación del Trigger

Para confirmar que el trigger está correctamente instalado, ejecuta en SQL Editor:

```sql
-- Ver función
SELECT
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';

-- Ver trigger
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

**Resultado esperado**:

- `handle_new_user`: Debe existir como función (FUNCTION)
- `on_auth_user_created`: Debe existir como trigger en `auth.users` con timing `AFTER` y evento `INSERT`

## 🐛 Solución de Problemas

### Error: "Usuario autenticado pero no encontrado" persiste

**Posibles causas**:

1. **El trigger no se ejecutó correctamente**:

   - Verifica que el script se ejecutó sin errores
   - Revisa los logs de Supabase en Dashboard → Logs → Postgres Logs

2. **Permisos insuficientes**:

   - La función debe tener `SECURITY DEFINER` (ya incluido en el script)
   - Verifica que tu usuario de Supabase tenga permisos de admin

3. **Conflicto con políticas RLS**:
   - Verifica que la tabla `usuarios` permita INSERT desde el trigger
   - Ejecuta:
     ```sql
     SELECT * FROM pg_policies WHERE tablename = 'usuarios';
     ```

### El trigger se ejecuta pero el usuario no se crea

**Verificar logs**:

```sql
-- Ver últimos usuarios creados en auth
SELECT id, email, created_at, raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- Ver últimos usuarios en tabla usuarios
SELECT * FROM public.usuarios
ORDER BY created_at DESC
LIMIT 5;
```

### Quiero eliminar un usuario de prueba

```sql
-- CUIDADO: Esto elimina permanentemente el usuario
-- Primero de la tabla usuarios
DELETE FROM public.usuarios WHERE email = 'usuario@ejemplo.com';

-- Luego de auth (requiere permisos de service_role)
-- Mejor hacerlo desde Supabase Dashboard → Authentication → Users
```

## 📊 Comportamiento Esperado

| Método de Login | Estado Inicial   | Acceso Inmediato                   |
| --------------- | ---------------- | ---------------------------------- |
| Google OAuth    | `activo = true`  | ✅ Sí                              |
| Email/Password  | `activo = false` | ❌ No (requiere activación manual) |

## 📞 Siguiente Paso

Después de ejecutar el script [`FIX_TRIGGER_SUPABASE.sql`](file:///home/chris/Github/CITAPP-project/FIX_TRIGGER_SUPABASE.sql):

1. Intenta hacer login con Google
2. Si funciona: ✅ Problema resuelto
3. Si NO funciona: Comparte los logs de la consola del navegador y los resultados de las queries de verificación
