/*
  # Migración: Agregar Código de Empleado y Tracking de Verificaciones
  
  ## Descripción
  Agrega funcionalidad para empleados con códigos únicos de 5 dígitos
  y tracking de verificaciones de inventario realizadas por empleados.
  
  ## Cambios
  1. Agregar campo `codigo` OPCIONAL a tabla `usuarios` (solo para empleados)
  2. Agregar campo `empleado_codigo` a tabla `verificaciones_inventario`
  3. Función para generar códigos únicos de 5 dígitos
  4. Actualizar políticas RLS para permitir verificaciones públicas con código válido
*/

-- 1. Agregar campo codigo a tabla usuarios (OPCIONAL - solo para empleados)
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS codigo text UNIQUE;

-- Comentario explicativo
COMMENT ON COLUMN usuarios.codigo IS 'Código único de 5 dígitos para empleados. NULL para administradores.';

-- 2. Agregar campo empleado_codigo a verificaciones_inventario
ALTER TABLE verificaciones_inventario
ADD COLUMN IF NOT EXISTS empleado_codigo text;

-- Comentario explicativo
COMMENT ON COLUMN verificaciones_inventario.empleado_codigo IS 'Código del empleado que realizó la verificación';

-- 3. Crear índice para optimización
CREATE INDEX IF NOT EXISTS idx_verificaciones_empleado 
ON verificaciones_inventario(empleado_codigo);

-- 4. Función para generar código único de 5 dígitos
CREATE OR REPLACE FUNCTION generar_codigo_empleado()
RETURNS text AS $$
DECLARE
  nuevo_codigo text;
  codigo_existe boolean;
BEGIN
  LOOP
    -- Generar código aleatorio de 5 dígitos
    nuevo_codigo := LPAD(FLOOR(RANDOM() * 100000)::text, 5, '0');
    
    -- Verificar si el código ya existe
    SELECT EXISTS(
      SELECT 1 FROM usuarios WHERE codigo = nuevo_codigo
    ) INTO codigo_existe;
    
    -- Si no existe, salir del loop
    EXIT WHEN NOT codigo_existe;
  END LOOP;
  
  RETURN nuevo_codigo;
END;
$$ LANGUAGE plpgsql;

-- 5. Actualizar política de inserción en verificaciones_inventario
-- Eliminar política anterior si existe
DROP POLICY IF EXISTS "Usuarios pueden insertar verificaciones" ON verificaciones_inventario;

-- Nueva política: permitir inserción pública con código de empleado válido
CREATE POLICY "Empleados pueden insertar verificaciones con código válido"
  ON verificaciones_inventario FOR INSERT
  TO public
  WITH CHECK (
    -- Permitir si el empleado_codigo existe y el usuario está activo
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.codigo = empleado_codigo
      AND usuarios.rol = 'empleado'
      AND usuarios.activo = true
    )
    OR
    -- O si es un usuario autenticado (para mantener compatibilidad)
    auth.uid() IS NOT NULL
  );

-- 6. Agregar constraint para validar formato de código (5 dígitos)
ALTER TABLE usuarios
ADD CONSTRAINT check_codigo_formato 
CHECK (codigo IS NULL OR codigo ~ '^\d{5}$');

COMMENT ON CONSTRAINT check_codigo_formato ON usuarios IS 'El código debe ser NULL o exactamente 5 dígitos numéricos';
