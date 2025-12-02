/*
  # Corregir RLS para verificación de empleados

  ## Descripción
  Permite que el rol público (anon) pueda leer la información de los usuarios
  que tienen rol 'empleado' y un código asignado. Esto es necesario para:
  1. Que el frontend pueda validar el código antes de enviar.
  2. Que la política de INSERT en verificaciones_inventario pueda validar el código.
*/

-- Permitir lectura pública de empleados con código
CREATE POLICY "Lectura pública de empleados para verificación"
  ON usuarios FOR SELECT
  TO public
  USING (rol = 'empleado' AND codigo IS NOT NULL);
