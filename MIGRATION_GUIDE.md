# Guía de Aplicación: Migración OAuth User Activation

## 📋 Resumen

Esta migración corrige el problema donde los usuarios de Google OAuth no pueden iniciar sesión porque:

1. Se crean como **inactivos** por defecto
2. **El trigger no se ejecuta correctamente** y no crea el registro en la tabla `usuarios`

## 🎯 Solución Implementada

**Opción 1: Diferenciación Automática**

- ✅ Usuarios OAuth (Google): **activos** automáticamente
- ✅ Usuarios email/password: **inactivos** (requieren aprobación manual)

## ⚠️ IMPORTANTE: Problema del Trigger

Si ves el error **"Usuario autenticado pero no encontrado en tabla usuarios después de reintentos"**, significa que el trigger `on_auth_user_created` no se está ejecutando correctamente.

**Solución rápida**: Ejecuta el script [`FIX_TRIGGER_SUPABASE.sql`](file:///home/chris/Github/CITAPP-project/FIX_TRIGGER_SUPABASE.sql) en el SQL Editor de Supabase.

**Guía completa**: Ver [`SOLUCION_OAUTH.md`](file:///home/chris/Github/CITAPP-project/SOLUCION_OAUTH.md)

## 📝 Archivos de Migración

- **Script de corrección rápida**: [`FIX_TRIGGER_SUPABASE.sql`](file:///home/chris/Github/CITAPP-project/FIX_TRIGGER_SUPABASE.sql) ⭐ **USAR ESTE**
- Migración original: [`supabase/migrations/20251127_fix_oauth_inactive_users.sql`](file:///home/chris/Github/CITAPP-project/supabase/migrations/20251127_fix_oauth_inactive_users.sql)
- Migración final: [`supabase/migrations/20251127_fix_trigger_final.sql`](file:///home/chris/Github/CITAPP-project/supabase/migrations/20251127_fix_trigger_final.sql)

## 🚀 Cómo Aplicar la Migración

### Método 1: Dashboard de Supabase (Recomendado) ⭐

1. **Acceder al Dashboard de Supabase**

   - Ir a [https://app.supabase.com/](https://app.supabase.com/)
   - Seleccionar tu proyecto CITAPP

2. **Abrir SQL Editor**

   - En el menú lateral, ir a **SQL Editor**
   - Click en **New query**

3. **Copiar y Ejecutar el Script de Corrección**

   - Abrir el archivo [`FIX_TRIGGER_SUPABASE.sql`](file:///home/chris/Github/CITAPP-project/FIX_TRIGGER_SUPABASE.sql)
   - Copiar **todo el contenido** del archivo
   - Pegarlo en el editor SQL de Supabase
   - Click en **Run** (o presionar `Ctrl + Enter`)

4. **Verificar Ejecución**
   - Deberías ver el mensaje: `Success`
   - En los resultados deberías ver una fila confirmando que el trigger `on_auth_user_created` existe

### Método 2: Supabase CLI (Si está configurado)

```bash
# Vincular proyecto (solo primera vez)
npx supabase link --project-ref TU_PROJECT_REF

# Aplicar migración
npx supabase db push
```

## ✅ Verificación

### 1. Verificar que el Trigger se Actualizó

En el SQL Editor de Supabase, ejecutar:

```sql
-- Ver la función actualizada
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'handle_new_user';
```

Deberías ver la nueva lógica con `is_oauth` en el código.

### 2. Probar Login con Google

1. **Limpiar usuarios de prueba anteriores** (opcional):

   ```sql
   -- En SQL Editor de Supabase
   DELETE FROM auth.users WHERE email = 'tu_email_de_prueba@gmail.com';
   ```

2. **Intentar login con Google**:

   - Ir a http://localhost:5173/login
   - Click en "Continuar con Google"
   - Seleccionar cuenta de Google
   - Aceptar permisos

3. **Verificar creación del usuario**:

   ```sql
   -- En SQL Editor de Supabase
   SELECT id, email, nombre, apellidos, rol, activo, created_at
   FROM usuarios
   ORDER BY created_at DESC
   LIMIT 5;
   ```

   El usuario OAuth debería tener `activo = true`

4. **Confirmar acceso al dashboard**:
   - Deberías ser redirigido automáticamente a `/dashboard`
   - No deberías ver la pantalla de "Cuenta Pendiente"

### 3. Probar Registro Email/Password (Opcional)

Si tienes registro de email/password habilitado:

1. Crear un nuevo usuario con email/password
2. Verificar en la tabla `usuarios` que `activo = false`
3. Confirmar que muestra la pantalla de "Cuenta Pendiente"

## 🔧 Solución de Problemas

### Error: "function handle_new_user() does not exist"

**Causa**: La función no existe en tu base de datos.

**Solución**: Primero ejecutar las migraciones anteriores:

```sql
-- Ejecutar en orden:
-- 1. 20251108004910_auto_create_usuario_on_signup.sql
-- 2. 20251127_fix_oauth_inactive_users.sql
```

### Usuario OAuth sigue apareciendo como inactivo

**Causa**: Usuario fue creado antes de aplicar la migración.

**Solución**: Activar manualmente el usuario:

```sql
UPDATE usuarios
SET activo = true
WHERE email = 'email_del_usuario@gmail.com';
```

### Error: "permission denied for table usuarios"

**Causa**: Permisos insuficientes.

**Solución**: Ejecutar el SQL como usuario con permisos de administrador en Supabase Dashboard.

## 📊 Comportamiento Esperado

### Antes de la Migración

```
Usuario Google OAuth → auth.users (creado) → trigger → usuarios (activo = false) → ❌ Pantalla "Cuenta Pendiente"
```

### Después de la Migración

```
Usuario Google OAuth → auth.users (creado) → trigger → usuarios (activo = true) → ✅ Acceso al Dashboard
Usuario Email/Pass   → auth.users (creado) → trigger → usuarios (activo = false) → ⏳ Requiere aprobación
```

## 📝 Notas Importantes

1. **Usuarios existentes**: Esta migración NO afecta usuarios ya creados. Si tienes usuarios OAuth inactivos, debes activarlos manualmente.

2. **Detección OAuth**: La función detecta OAuth si encuentra alguno de estos campos en `raw_user_meta_data`:

   - `provider`
   - `full_name`
   - `avatar_url`

3. **Seguridad**: Los usuarios OAuth ya están verificados por Google, por eso se activan automáticamente.

4. **Reversión**: Si necesitas revertir, puedes ejecutar:
   ```sql
   -- Volver a la versión anterior (todos inactivos)
   -- Ejecutar el contenido de: 20251127_update_user_trigger_inactive.sql
   ```

## 🎯 Próximos Pasos

1. ✅ Aplicar la migración en Supabase Dashboard
2. ✅ Verificar que el trigger se actualizó correctamente
3. ✅ Probar login con Google
4. ✅ Confirmar que usuarios OAuth se crean activos
5. ✅ Actualizar documentación del proyecto

## 📞 Soporte

Si encuentras problemas:

1. Verificar logs en la consola del navegador (F12)
2. Revisar logs de Supabase en el Dashboard → Logs
3. Consultar la [documentación de Supabase Auth](https://supabase.com/docs/guides/auth)
