/*
  # Productos de muestra para el sistema CITAPP

  ## Descripción
  Inserción de productos de ejemplo para demostración del sistema.

  ## Productos agregados
    - Sierras circulares
    - Taladros
    - Martillos
    - Material de construcción
*/

-- Insertar productos de ejemplo
INSERT INTO productos (clave, nombre, marca, tipo, cantidad, clasificacion, categoria_id, ubicacion_id) VALUES
  (
    'SAC100601',
    'Sierra circular Einhell 7 1/4',
    'Einhell',
    'Herramienta eléctrica',
    30,
    'frágil',
    (SELECT id FROM categorias WHERE nombre = 'Herramientas Eléctricas' LIMIT 1),
    (SELECT id FROM ubicaciones WHERE codigo = 'A1-1' LIMIT 1)
  ),
  (
    'TAL200301',
    'Taladro percutor Bosch Professional',
    'Bosch',
    'Herramienta eléctrica',
    25,
    'frágil',
    (SELECT id FROM categorias WHERE nombre = 'Herramientas Eléctricas' LIMIT 1),
    (SELECT id FROM ubicaciones WHERE codigo = 'A1-2' LIMIT 1)
  ),
  (
    'MAR150201',
    'Martillo de carpintero Stanley',
    'Stanley',
    'Herramienta manual',
    50,
    'no frágil',
    (SELECT id FROM categorias WHERE nombre = 'Herramientas Manuales' LIMIT 1),
    (SELECT id FROM ubicaciones WHERE codigo = 'B1-1' LIMIT 1)
  ),
  (
    'CEM300101',
    'Cemento Portland gris 50kg',
    'Cemex',
    'Material construcción',
    100,
    'no frágil',
    (SELECT id FROM categorias WHERE nombre = 'Material de Construcción' LIMIT 1),
    (SELECT id FROM ubicaciones WHERE codigo = 'B2-1' LIMIT 1)
  ),
  (
    'TAL200302',
    'Taladro inalámbrico DeWalt',
    'DeWalt',
    'Herramienta eléctrica',
    15,
    'frágil',
    (SELECT id FROM categorias WHERE nombre = 'Herramientas Eléctricas' LIMIT 1),
    (SELECT id FROM ubicaciones WHERE codigo = 'A1-1' LIMIT 1)
  ),
  (
    'CAS400101',
    'Casco de seguridad 3M',
    '3M',
    'Equipo de protección',
    80,
    'frágil',
    (SELECT id FROM categorias WHERE nombre = 'Equipos de Seguridad' LIMIT 1),
    (SELECT id FROM ubicaciones WHERE codigo = 'A1-2' LIMIT 1)
  )
ON CONFLICT (clave) DO NOTHING;
