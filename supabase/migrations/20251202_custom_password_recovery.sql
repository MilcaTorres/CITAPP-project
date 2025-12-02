/*
  # Sistema de Recuperación de Contraseña Personalizado
  
  Debido a limitaciones con las plantillas de correo de Supabase, implementamos
  un sistema propio donde:
  1. El frontend genera un código y lo envía por EmailJS.
  2. La base de datos guarda ese código temporalmente.
  3. Una función segura verifica el código y actualiza la contraseña en auth.users.
*/

-- 1. Habilitar extensión para encriptar contraseñas (si no existe)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Agregar columnas para el código de recuperación en la tabla usuarios
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS recovery_code text,
ADD COLUMN IF NOT EXISTS recovery_expires timestamptz;

-- 3. Función para guardar el código de recuperación
-- Esta función se llama desde el frontend antes de enviar el correo
CREATE OR REPLACE FUNCTION request_password_recovery(
  user_email text,
  code text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- Se ejecuta con permisos de superusuario para poder escribir
AS $$
BEGIN
  -- Verificar que el usuario existe
  IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = user_email) THEN
    RETURN false;
  END IF;

  -- Guardar el código y la expiración (15 minutos)
  UPDATE usuarios
  SET 
    recovery_code = code,
    recovery_expires = now() + interval '15 minutes'
  WHERE email = user_email;

  RETURN true;
END;
$$;

-- 4. Función para verificar código y cambiar contraseña
-- Esta función actualiza directamente la tabla auth.users
CREATE OR REPLACE FUNCTION reset_password_with_code(
  user_email text,
  code text,
  new_password text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- 1. Buscar al usuario y verificar código
  SELECT id INTO target_user_id
  FROM usuarios
  WHERE email = user_email
    AND recovery_code = code
    AND recovery_expires > now();

  -- Si no se encuentra o expiró
  IF target_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- 2. Actualizar la contraseña en auth.users Y confirmar el email
  -- Usamos pgcrypto para hashear la contraseña igual que Supabase (bcrypt)
  UPDATE auth.users
  SET 
    encrypted_password = crypt(new_password, gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, now()) -- Confirmar si no está confirmado
  WHERE id = target_user_id;

  -- 3. Limpiar el código usado
  UPDATE usuarios
  SET recovery_code = NULL, recovery_expires = NULL
  WHERE id = target_user_id;

  RETURN true;
END;
$$;

-- 5. Dar permisos de ejecución a la función pública
GRANT EXECUTE ON FUNCTION request_password_recovery TO public;
GRANT EXECUTE ON FUNCTION reset_password_with_code TO public;
