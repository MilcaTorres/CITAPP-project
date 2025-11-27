/*
  # Fix: Activar usuarios OAuth por defecto
  
  ## Descripción
  Actualiza el trigger handle_new_user() para diferenciar entre usuarios OAuth
  y usuarios de email/password, activando automáticamente a los usuarios OAuth.
  
  ## Cambios
  - Usuarios OAuth (Google, etc.): activo = true (acceso inmediato)
  - Usuarios email/password: activo = false (requieren aprobación manual)
  - Mejora extracción de nombre completo de metadatos OAuth
  
  ## Detección OAuth
  Se considera OAuth si:
  - Existe campo 'provider' en raw_user_meta_data
  - Existe campo 'full_name' en raw_user_meta_data (típico de Google)
  - Existe campo 'avatar_url' en raw_user_meta_data
*/

-- Reemplazar función handle_new_user con lógica mejorada
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  full_name text;
  first_name text;
  last_name text;
  is_oauth boolean;
BEGIN
  -- Detectar si es OAuth (Google, etc.) o email/password
  -- OAuth providers típicamente incluyen 'provider', 'full_name' o 'avatar_url' en metadata
  is_oauth := (
    NEW.raw_user_meta_data->>'provider' IS NOT NULL 
    OR NEW.raw_user_meta_data->>'full_name' IS NOT NULL
    OR NEW.raw_user_meta_data->>'avatar_url' IS NOT NULL
  );
  
  -- Extraer nombre completo de diferentes campos posibles
  full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',  -- Google OAuth
    NEW.raw_user_meta_data->>'name',        -- Otros providers
    NEW.raw_user_meta_data->>'nombre'       -- Registro manual
  );
  
  -- Dividir nombre completo en nombre y apellidos
  IF full_name IS NOT NULL AND full_name != '' THEN
    -- Tomar primera palabra como nombre, resto como apellidos
    first_name := SPLIT_PART(full_name, ' ', 1);
    last_name := TRIM(SUBSTRING(full_name FROM LENGTH(first_name) + 1));
    
    -- Si no hay apellidos después de dividir, dejar vacío
    IF last_name IS NULL THEN
      last_name := '';
    END IF;
  ELSE
    -- Fallback a campos individuales si full_name no existe
    first_name := COALESCE(NEW.raw_user_meta_data->>'nombre', 'Usuario');
    last_name := COALESCE(NEW.raw_user_meta_data->>'apellidos', '');
  END IF;
  
  -- Insertar usuario en tabla usuarios
  INSERT INTO public.usuarios (id, rol, nombre, apellidos, email, activo)
  VALUES (
    NEW.id,
    'admin',      -- Rol por defecto
    first_name,
    last_name,
    NEW.email,
    is_oauth      -- TRUE para OAuth (activo), FALSE para email/password (inactivo)
  )
  ON CONFLICT (id) DO NOTHING;  -- No sobrescribir si ya existe
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- El trigger ya existe, no necesitamos recrearlo
-- Solo actualizamos la función que ejecuta

-- Log de cambio
DO $$
BEGIN
  RAISE NOTICE 'Trigger handle_new_user actualizado: OAuth users activos, email/password users inactivos';
END $$;
