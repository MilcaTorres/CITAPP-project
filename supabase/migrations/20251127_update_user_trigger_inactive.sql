/*
  # Update trigger to set new users as inactive by default
  
  ## Changes
  - Update handle_new_user function to set activo = false
  - Improve name extraction from metadata (support full_name)
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  full_name text;
  first_name text;
  last_name text;
BEGIN
  -- Extract name from metadata
  full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '');
  
  -- If we have a full name but no specific parts, try to split it
  IF full_name != '' AND (NEW.raw_user_meta_data->>'nombre') IS NULL THEN
    first_name := split_part(full_name, ' ', 1);
    last_name := substring(full_name from length(first_name) + 2);
  ELSE
    first_name := COALESCE(NEW.raw_user_meta_data->>'nombre', 'Usuario');
    last_name := COALESCE(NEW.raw_user_meta_data->>'apellidos', '');
  END IF;

  INSERT INTO public.usuarios (id, rol, nombre, apellidos, email, activo)
  VALUES (
    NEW.id,
    'admin', -- Default role
    first_name,
    last_name,
    NEW.email,
    false -- Default to inactive
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    nombre = EXCLUDED.nombre,
    apellidos = EXCLUDED.apellidos;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
