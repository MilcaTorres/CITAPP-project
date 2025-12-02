-- ============================================================
-- EJECUTAR ESTE SCRIPT EN SUPABASE SQL EDITOR
-- ============================================================
-- Este script corrige el problema de usuarios OAuth no creados
-- en la tabla usuarios
-- ============================================================

-- PASO 1: Eliminar triggers existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

-- PASO 2: Eliminar función existente
DROP FUNCTION IF EXISTS public.handle_new_user();

-- PASO 3: Crear función mejorada
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  full_name text;
  first_name text;
  last_name text;
  is_oauth boolean;
BEGIN
  -- Detectar si es OAuth
  is_oauth := (
    NEW.raw_user_meta_data->>'provider' IS NOT NULL 
    OR NEW.raw_user_meta_data->>'full_name' IS NOT NULL
    OR NEW.raw_user_meta_data->>'avatar_url' IS NOT NULL
  );
  
  -- Extraer nombre completo
  full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'nombre'
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
    is_oauth
  )
  ON CONFLICT (id) DO NOTHING;
  
  RAISE NOTICE 'Usuario creado: % (OAuth: %, Activo: %)', NEW.email, is_oauth, is_oauth;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 4: Crear trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- PASO 5: Verificar que el trigger existe
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
