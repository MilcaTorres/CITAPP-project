# Guía Rápida de Uso - CITAPP

## Inicio Rápido

### 1. Instalar y Ejecutar

```bash
npm install
npm run dev
```

La aplicación estará disponible en: http://localhost:5173

### 2. Primer Uso

#### Como Empleado (Sin login)
La aplicación se abre directamente en la vista de productos. Puedes:
- Ver todos los productos disponibles
- Buscar productos por nombre, clave o marca
- Hacer clic en cualquier producto para ver sus detalles
- Usar el botón "Escanear código QR" para buscar productos

#### Como Administrador (Primera vez)

1. **Crear usuario administrador en Supabase**:
   - Ve a tu proyecto en https://supabase.com
   - Authentication → Users → Add user
   - Email: `admin@citapp.com`
   - Password: `admin123`
   - ✅ Auto Confirm User
   - Create user

2. **Registrar en la base de datos**:
   - Ve a SQL Editor en Supabase
   - Ejecuta:
   ```sql
   INSERT INTO usuarios (id, rol, nombre, apellidos, email, activo)
   VALUES (
     (SELECT id FROM auth.users WHERE email = 'admin@citapp.com' LIMIT 1),
     'admin',
     'Administrador',
     'CITAPP',
     'admin@citapp.com',
     true
   );
   ```

3. **Iniciar sesión**:
   - En la aplicación, haz clic en "Mi perfil" (esquina superior derecha)
   - Ingresa las credenciales
   - ¡Listo! Ahora tienes acceso completo

## Funciones Principales

### Gestión de Productos

#### Ver Productos
- **Ubicación**: Menú lateral → Icono de paquete
- **Acción**: Click en cualquier tarjeta de producto para ver detalles

#### Agregar Producto (Admin)
1. Click en "Agregar producto" (botón rojo)
2. Llenar formulario:
   - Código/Clave: Identificador único (ej: SAC100601)
   - Nombre: Nombre del producto
   - Marca: Marca del producto (opcional)
   - Tipo: Tipo de producto (opcional)
   - Cantidad: Stock inicial
   - Clasificación: Frágil o No frágil
   - Categoría: Seleccionar de la lista
   - Ubicación: Seleccionar de la lista
3. Click en "Guardar"

#### Generar Código QR (Admin)
1. Abrir detalles del producto
2. Click en "Generar QR"
3. El código QR se muestra automáticamente
4. Click derecho → Guardar imagen para descargar

#### Editar Producto (Admin)
1. Abrir detalles del producto
2. Click en "Editar producto"
3. Modificar campos necesarios
4. Click en "Guardar"

#### Eliminar Producto (Admin)
1. Abrir detalles del producto
2. Click en el icono de basura (rojo)
3. Confirmar eliminación

### Buscar Productos

#### Búsqueda por Texto
- Escribir en el campo de búsqueda
- Se busca en: nombre, clave y marca
- Resultados en tiempo real

#### Búsqueda por QR
1. Click en "Escanear código QR"
2. Ingresar manualmente el código o clave
3. Click en "Buscar"
4. Se abre el detalle del producto

### Gestión de Administradores (Solo Admin)

#### Ver Administradores
- **Ubicación**: Menú lateral → Icono de usuarios

#### Agregar Administrador
1. Click en "Registrar administrador"
2. Llenar formulario:
   - Nombre(s)
   - Apellido(s)
   - Correo electrónico (será el usuario)
   - Contraseña (mínimo 6 caracteres)
   - Confirmar contraseña
3. Click en "Aceptar"

**Nota**: El usuario se crea automáticamente tanto en Auth como en la base de datos.

#### Editar Administrador
1. Click en el icono de lápiz en la fila del administrador
2. Modificar nombre o apellidos
3. Click en "Aceptar"

**Nota**: No se puede cambiar el email. Para cambiar contraseña, el usuario debe hacerlo desde su perfil.

#### Desactivar/Activar Administrador
1. Click en el icono de usuario tachado (desactivar) o usuario con check (activar)
2. El cambio es inmediato

**Nota**: Un administrador desactivado no puede iniciar sesión.

### Mi Perfil (Solo Admin)

#### Ver Perfil
- **Ubicación**: Header → "Mi perfil" o Menú lateral → Icono de usuario

#### Cambiar Contraseña
1. En Mi Perfil, click en "Editar"
2. Ingresar:
   - Contraseña actual
   - Nueva contraseña (mínimo 6 caracteres)
   - Confirmar nueva contraseña
3. Click en "Aceptar"

#### Cerrar Sesión
- **Ubicación**: Menú lateral → Icono de salida (abajo)

## Dashboard (Solo Admin)

Al iniciar sesión, verás:
- **Productos Disponibles**: Productos con stock > 0
- **Total Productos**: Todos los productos registrados

## Datos de Ejemplo

El sistema incluye 6 productos de ejemplo:
1. Sierra circular Einhell 7 1/4
2. Taladro percutor Bosch Professional
3. Martillo de carpintero Stanley
4. Cemento Portland gris 50kg
5. Taladro inalámbrico DeWalt
6. Casco de seguridad 3M

También incluye:
- 4 categorías: Herramientas Eléctricas, Herramientas Manuales, Material de Construcción, Equipos de Seguridad
- 4 ubicaciones: A1-1, A1-2, B1-1, B2-1

## Atajos de Teclado

- **Enter** en campo de búsqueda: Aplicar búsqueda
- **Esc** en modales: Cerrar modal

## Indicadores Visuales

### Estado de Stock
- 🟢 **Verde**: Stock suficiente (≥10 unidades)
- 🟡 **Amarillo**: Stock bajo (<10 unidades)
- 🔴 **Rojo**: Sin stock (0 unidades)

### Estado de Administrador
- 🟢 **Activo**: Puede iniciar sesión
- 🔴 **Desactivado**: No puede iniciar sesión

## Solución de Problemas

### No puedo iniciar sesión
✅ Verifica que el usuario existe en Auth
✅ Verifica que el usuario existe en la tabla usuarios
✅ Verifica que el usuario está activo
✅ Verifica email y contraseña

### No veo ningún producto
✅ Verifica tu conexión a internet
✅ Revisa la consola del navegador (F12) por errores
✅ Verifica que las migraciones se ejecutaron correctamente

### Los códigos QR no se generan
✅ Verifica tu conexión a internet (usa API externa)
✅ Intenta refrescar la página
✅ Verifica permisos de administrador

## Recomendaciones

### Para Empleados
- Usa la búsqueda para encontrar productos rápidamente
- Verifica el stock antes de cualquier operación
- Reporta productos con bajo stock a tu supervisor

### Para Administradores
- Genera códigos QR para todos los productos
- Actualiza el stock regularmente
- Revisa el dashboard periódicamente
- Mantén actualizada la información de productos
- Cambia tu contraseña periódicamente
- Desactiva administradores que ya no trabajan en lugar de eliminarlos

## Soporte

Si encuentras problemas:
1. Revisa esta guía
2. Consulta SETUP.md para configuración
3. Consulta README.md para información técnica
4. Revisa la consola del navegador (F12)
5. Contacta al equipo de desarrollo

---

**Sistema CITAPP** - Control de Inventario con Tecnología de Aplicación
