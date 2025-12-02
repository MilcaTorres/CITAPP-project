/*
  # Permitir lectura de emails de administradores
  
  ## Descripción
  Esta política permite que cualquier usuario (incluido público/anon) pueda leer
  los emails de los usuarios con rol 'admin' y que estén activos.
  
  Esto es necesario para que el servicio de envío de correos (EmailJS) pueda
  obtener la lista de destinatarios dinámicamente desde el frontend.
*/

CREATE POLICY "Lectura pública de emails de administradores"
  ON usuarios FOR SELECT
  TO public
  USING (rol = 'admin' AND activo = true);
