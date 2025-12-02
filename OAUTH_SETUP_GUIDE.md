# Guía de Configuración: Google OAuth2.0 con Supabase

## 📋 Resumen de Cambios Realizados

### ✅ Bug de Doble Login - CORREGIDO

**Problema identificado**: El código en `AuthContext.tsx` (líneas 23-31) ejecutaba `signOut()` en cada carga de página, cancelando el primer intento de login.

**Solución aplicada**: Se eliminó completamente el `useEffect` problemático que causaba el cierre de sesión automático.

### ✅ OAuth2.0 con Google - IMPLEMENTADO

Se agregaron las siguientes funcionalidades:

1. **AuthContext.tsx**:

   - Nuevo método `signInWithGoogle()` para autenticación OAuth
   - Integración con Supabase OAuth provider
   - Redirección automática al dashboard después del login

2. **LoginView.tsx**:
   - Botón "Continuar con Google" con logo oficial
   - Separador visual entre login tradicional y OAuth
   - Manejo de errores específico para OAuth

## 🔧 Configuración Requerida

### Paso 1: Configurar Google Cloud Console

1. **Acceder a Google Cloud Console**:

   - Ir a [https://console.cloud.google.com/](https://console.cloud.google.com/)
   - Crear un nuevo proyecto o seleccionar uno existente

2. **Configurar OAuth Consent Screen**:

   - Buscar "OAuth consent screen" en la barra de búsqueda
   - Seleccionar tipo de usuario:
     - **Internal**: Solo usuarios de tu organización (Google Workspace)
     - **External**: Cualquier usuario con cuenta de Google
   - Completar la información requerida:
     - Nombre de la aplicación
     - Email de soporte
     - Logo (opcional)
     - Dominio de la aplicación

3. **Crear Credenciales OAuth**:
   - Ir a "Credentials" en el menú lateral
   - Click en "Create Credentials" → "OAuth client ID"
   - Seleccionar "Web application"
   - Configurar:
     - **Nombre**: CITAPP Login
     - **Authorized JavaScript origins**:
       ```
       http://localhost:5173
       https://tu-dominio.com (para producción)
       ```
     - **Authorized redirect URIs**:
       ```
       https://[TU-PROJECT-ID].supabase.co/auth/v1/callback
       ```
   - Click en "Create"
   - **IMPORTANTE**: Copiar el **Client ID** y **Client Secret**

### Paso 2: Configurar Supabase

1. **Acceder al Dashboard de Supabase**:

   - Ir a [https://app.supabase.com/](https://app.supabase.com/)
   - Seleccionar tu proyecto CITAPP

2. **Habilitar Google Provider**:

   - Ir a "Authentication" → "Providers"
   - Buscar "Google" en la lista
   - Activar el toggle
   - Pegar las credenciales de Google:
     - **Client ID**: (del paso anterior)
     - **Client Secret**: (del paso anterior)
   - Click en "Save"

3. **Verificar Redirect URL**:
   - Copiar la URL de callback que muestra Supabase
   - Asegurarse de que coincida con la configurada en Google Cloud Console
   - Formato: `https://[PROJECT-ID].supabase.co/auth/v1/callback`

### Paso 3: Configurar la Base de Datos

**IMPORTANTE**: El trigger `handle_new_user()` ya está configurado en el proyecto mediante migraciones.

La versión actual del trigger:

- ✅ Activa automáticamente usuarios OAuth (Google)
- ✅ Mantiene inactivos usuarios de email/password (requieren aprobación)
- ✅ Extrae correctamente nombre completo de metadatos OAuth

**Si necesitas aplicar o actualizar el trigger**, ejecuta la migración:

- Ver: [`supabase/migrations/20251127_fix_oauth_inactive_users.sql`](file:///home/chris/Github/CITAPP-project/supabase/migrations/20251127_fix_oauth_inactive_users.sql)
- Guía: [`MIGRATION_GUIDE.md`](file:///home/chris/Github/CITAPP-project/MIGRATION_GUIDE.md)

**Comportamiento del trigger**:

```sql
-- Usuarios OAuth (Google, etc.)
-- → activo = true (acceso inmediato)

-- Usuarios email/password
-- → activo = false (requieren aprobación manual de admin)
```

## 🧪 Pruebas

### Test 1: Login Tradicional (Email/Password)

1. Abrir http://localhost:5173/login
2. Ingresar credenciales válidas
3. Click en "Iniciar Sesión"
4. **Verificar**:
   - ✅ Login exitoso en el **primer intento** (no requiere segundo intento)
   - ✅ Redirección a `/dashboard`
   - ✅ No hay errores en la consola del navegador
   - ✅ La sesión persiste al recargar la página

### Test 2: Login con Google OAuth

> **NOTA**: Este test solo funcionará después de completar la configuración de Google Cloud Console y Supabase.

1. Abrir http://localhost:5173/login
2. Click en "Continuar con Google"
3. **Verificar**:
   - ✅ Redirección a la página de login de Google
   - ✅ Seleccionar cuenta de Google
   - ✅ Aceptar permisos (primera vez)
   - ✅ Redirección de vuelta a la aplicación
   - ✅ Login exitoso y redirección a `/dashboard`
   - ✅ Usuario creado en la tabla `usuarios`

### Test 3: Persistencia de Sesión

1. Iniciar sesión (cualquier método)
2. Recargar la página (F5)
3. **Verificar**:
   - ✅ Usuario sigue autenticado
   - ✅ No se cierra la sesión automáticamente
   - ✅ Datos del usuario se cargan correctamente

### Test 4: Cerrar Sesión

1. Estando autenticado, click en "Cerrar Sesión"
2. **Verificar**:
   - ✅ Redirección a `/login`
   - ✅ Sesión cerrada correctamente
   - ✅ No se puede acceder a rutas protegidas

## 🐛 Solución de Problemas

### Error: "Invalid redirect URI"

**Causa**: La URL de redirección no coincide entre Google Cloud Console y Supabase.

**Solución**:

1. Verificar que la URL en Google Cloud Console sea exactamente:
   ```
   https://[TU-PROJECT-ID].supabase.co/auth/v1/callback
   ```
2. Esperar 5-10 minutos para que los cambios se propaguen

### Error: "OAuth provider not enabled"

**Causa**: Google provider no está habilitado en Supabase.

**Solución**:

1. Ir a Supabase Dashboard → Authentication → Providers
2. Activar Google provider
3. Guardar credenciales

### Error: "Access blocked: This app's request is invalid"

**Causa**: Configuración incorrecta en Google Cloud Console.

**Solución**:

1. Verificar que el OAuth Consent Screen esté completamente configurado
2. Si es tipo "External", asegurarse de que esté en modo "Testing" o "Published"
3. Agregar tu email como usuario de prueba si está en modo "Testing"

### Login tradicional sigue fallando en el primer intento

**Causa**: Caché del navegador o cambios no aplicados.

**Solución**:

1. Limpiar caché del navegador (Ctrl + Shift + Delete)
2. Cerrar todas las pestañas de la aplicación
3. Detener el servidor (`Ctrl + C`)
4. Reiniciar: `npm run dev`
5. Abrir en ventana de incógnito para probar

## 📝 Notas Importantes

1. **Seguridad**: Las credenciales de Google (Client Secret) son sensibles. No las compartas ni las subas a repositorios públicos.

2. **Producción**: Cuando despliegues a producción:

   - Actualizar las "Authorized JavaScript origins" en Google Cloud Console
   - Actualizar las "Authorized redirect URIs" con tu dominio de producción
   - Verificar que el `redirectTo` en `signInWithGoogle()` apunte a tu dominio

3. **Usuarios OAuth**: Los usuarios que se registren con Google:

   - No tendrán contraseña en Supabase
   - Su email será verificado automáticamente
   - Pueden tener información adicional (nombre, foto) de Google

4. **Roles**: Por defecto, los usuarios OAuth se crean con rol "usuario". Si necesitas asignar rol "admin", debes hacerlo manualmente en la base de datos.

## 🎯 Próximos Pasos

1. [ ] Completar configuración en Google Cloud Console
2. [ ] Habilitar Google provider en Supabase
3. [ ] Probar login tradicional (debe funcionar en primer intento)
4. [ ] Probar login con Google
5. [ ] Verificar creación de usuarios en la tabla `usuarios`
6. [ ] Probar en diferentes navegadores
7. [ ] Documentar credenciales de forma segura

## 📞 Soporte

Si encuentras algún problema durante la configuración:

1. Verificar logs en la consola del navegador (F12)
2. Revisar logs de Supabase en el Dashboard
3. Consultar la documentación oficial:
   - [Supabase Auth with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
   - [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
