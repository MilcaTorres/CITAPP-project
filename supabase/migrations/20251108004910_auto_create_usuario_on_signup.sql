/*
  # Trigger automático para crear registro de usuario

  ## Descripción
  Crea automáticamente un registro en la tabla usuarios cuando se crea un usuario en Auth.

  ## Funcionamiento
  - Se activa al crear un nuevo usuario en auth.users
  - Extrae los metadatos del usuario (nombre, apellidos)
  - Crea el registro correspondiente en la tabla usuarios
  - Asigna rol 'admin' por defecto
  - Marca como activo

  ## Notas
  - Facilita el proceso de registro de administradores
  - Mantiene sincronizadas las tablas auth.users y usuarios
*/

-- Función para crear usuario automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, rol, nombre, apellidos, email, activo)
  VALUES (
    NEW.id,
    'admin',
    COALESCE(NEW.raw_user_meta_data->>'nombre', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'apellidos', ''),
    NEW.email,
    true
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que se ejecuta al crear un nuevo usuario en auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
