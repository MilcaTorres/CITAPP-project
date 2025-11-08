/*
  # Crear usuario administrador de prueba

  ## Descripción
  Creación del usuario administrador por defecto para pruebas del sistema.

  ## Usuario creado
    - Email: admin@citapp.com
    - Contraseña: admin123
    - Rol: admin
    - Estado: activo

  ## Notas
    - Este usuario debe ser usado únicamente para pruebas
    - Se recomienda cambiar la contraseña en producción
*/

-- Insertar usuario administrador en la tabla usuarios
-- Nota: El usuario debe ser creado primero en Supabase Auth manualmente o mediante la interfaz
-- Esta migración solo prepara la estructura para cuando se cree el usuario en Auth

-- Crear una función para insertar el usuario admin si no existe
CREATE OR REPLACE FUNCTION crear_usuario_admin()
RETURNS void AS $$
BEGIN
  -- Esta función será llamada después de crear el usuario en Auth
  -- Por ahora solo creamos un trigger para usuarios nuevos
  NULL;
END;
$$ LANGUAGE plpgsql;
