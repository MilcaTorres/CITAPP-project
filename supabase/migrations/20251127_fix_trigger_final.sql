/*
  # Fix Final: Trigger para usuarios OAuth y Email/Password
  
  ## Problema
  El trigger on_auth_user_created no se está ejecutando correctamente,
  causando que usuarios OAuth no se creen en la tabla usuarios.
  
  ## Solución
  1. Eliminar completamente trigger y función existentes
  2. Recrear función con lógica correcta para OAuth
  3. Recrear trigger AFTER INSERT
  
  ## Comportamiento
  - Usuarios OAuth (Google): activo = true (acceso inmediato)
  - Usuarios email/password: activo = false (requieren aprobación)
*/

-- 1. ELIMINAR trigger existente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

-- 2. ELIMINAR función existente
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. CREAR función mejorada
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  full_name text;
  first_name text;
  last_name text;
  is_oauth boolean;
BEGIN
  -- Detectar si es OAuth basado en metadatos
  is_oauth := (
    NEW.raw_user_meta_data->>'provider' IS NOT NULL 
    OR NEW.raw_user_meta_data->>'full_name' IS NOT NULL
    OR NEW.raw_user_meta_data->>'avatar_url' IS NOT NULL
  );
  
  -- Extraer nombre completo
  full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',  -- Google OAuth
    NEW.raw_user_meta_data->>'name',        -- Otros providers
    NEW.raw_user_meta_data->>'nombre'       -- Registro manual
  );
  
  -- Dividir nombre completo
  IF full_name IS NOT NULL AND full_name != '' THEN
    first_name := SPLIT_PART(full_name, ' ', 1);
    last_name := TRIM(SUBSTRING(full_name FROM LENGTH(first_name) + 2));
    
    IF last_name IS NULL OR last_name = '' THEN
      last_name := '';
    END IF;
  ELSE
    first_name := COALESCE(NEW.raw_user_meta_data->>'nombre', 'Usuario');
    last_name := COALESCE(NEW.raw_user_meta_data->>'apellidos', '');
  END IF;
  
  -- Insertar en tabla usuarios
  INSERT INTO public.usuarios (id, rol, nombre, apellidos, email, activo)
  VALUES (
    NEW.id,
    'admin',
    first_name,
    last_name,
    NEW.email,
    is_oauth  -- TRUE para OAuth, FALSE para email/password
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Log para debugging
  RAISE NOTICE 'Usuario creado: % (OAuth: %, Activo: %)', NEW.email, is_oauth, is_oauth;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. CREAR trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Verificación
DO $$
BEGIN
  RAISE NOTICE '✓ Trigger on_auth_user_created recreado exitosamente';
  RAISE NOTICE '✓ Usuarios OAuth: activo = true';
  RAISE NOTICE '✓ Usuarios email/password: activo = false';
END $$;
