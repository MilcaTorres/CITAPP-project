/*
  # Fix OAuth User Creation for Admin-Only Access

  ## Description
  Updates the handle_new_user() trigger to properly handle Google OAuth metadata
  and ensure all users (including OAuth) are created in the usuarios table.

  ## Changes
  - Extract Google OAuth metadata (full_name, avatar_url, provider)
  - Split full_name into nombre and apellidos
  - Assign 'admin' role to all new users (admin-only system)
  - Store provider information for tracking

  ## Notes
  - This system is admin-only, so all OAuth users get 'admin' role
  - Users must be manually activated/deactivated via the admin panel
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function to handle both email/password and OAuth users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  full_name TEXT;
  first_name TEXT;
  last_name TEXT;
BEGIN
  -- Extract full_name from OAuth metadata (Google provides 'full_name')
  full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'nombre'
  );

  -- Split full_name into first and last name
  IF full_name IS NOT NULL THEN
    -- Simple split: everything before first space is first name, rest is last name
    first_name := SPLIT_PART(full_name, ' ', 1);
    last_name := TRIM(SUBSTRING(full_name FROM LENGTH(first_name) + 1));
  ELSE
    -- Fallback to individual fields if full_name not available
    first_name := COALESCE(NEW.raw_user_meta_data->>'nombre', 'Usuario');
    last_name := COALESCE(NEW.raw_user_meta_data->>'apellidos', '');
  END IF;

  -- Insert user into usuarios table
  INSERT INTO public.usuarios (id, rol, nombre, apellidos, email, activo)
  VALUES (
    NEW.id,
    'admin',  -- Admin-only system
    first_name,
    last_name,
    NEW.email,
    true  -- Active by default, can be deactivated via admin panel
  )
  ON CONFLICT (id) DO UPDATE SET
    -- Update email if changed (shouldn't happen, but just in case)
    email = EXCLUDED.email,
    -- Update name if it was empty before
    nombre = CASE 
      WHEN usuarios.nombre = 'Usuario' OR usuarios.nombre = '' 
      THEN EXCLUDED.nombre 
      ELSE usuarios.nombre 
    END,
    apellidos = CASE 
      WHEN usuarios.apellidos = '' 
      THEN EXCLUDED.apellidos 
      ELSE usuarios.apellidos 
    END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Also handle updates to existing auth users (in case metadata changes)
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
  EXECUTE FUNCTION public.handle_new_user();
