/*
  # Sistema CITAPP - Esquema de Base de Datos

  ## Descripción
  Creación de la estructura completa de base de datos para el sistema de gestión de inventario CITAPP.

  ## 1. Nuevas Tablas
    
  ### `categorias`
    - `id` (uuid, primary key)
    - `nombre` (text, unique)
    - `descripcion` (text)
    - `created_at` (timestamptz)

  ### `ubicaciones`
    - `id` (uuid, primary key)
    - `codigo` (text, unique)
    - `pasillo` (text)
    - `nivel` (text)
    - `seccion` (text)
    - `created_at` (timestamptz)

  ### `productos`
    - `id` (uuid, primary key)
    - `clave` (text, unique)
    - `nombre` (text)
    - `marca` (text)
    - `tipo` (text)
    - `cantidad` (integer)
    - `clasificacion` (text) - frágil/no frágil
    - `categoria_id` (uuid, foreign key)
    - `ubicacion_id` (uuid, foreign key)
    - `qr_url` (text)
    - `fecha_actualizacion` (timestamptz)
    - `created_at` (timestamptz)

  ### `usuarios`
    - `id` (uuid, primary key, references auth.users)
    - `rol` (text) - admin/empleado
    - `nombre` (text)
    - `apellidos` (text)
    - `email` (text, unique)
    - `activo` (boolean)
    - `created_at` (timestamptz)

  ### `movimientos`
    - `id` (uuid, primary key)
    - `producto_id` (uuid, foreign key)
    - `usuario_id` (uuid, foreign key)
    - `tipo` (text) - entrada/salida/verificacion
    - `cantidad` (integer)
    - `observaciones` (text)
    - `fecha` (timestamptz)
    - `created_at` (timestamptz)

  ### `verificaciones_inventario`
    - `id` (uuid, primary key)
    - `producto_id` (uuid, foreign key)
    - `cantidad_sistema` (integer)
    - `cantidad_fisica` (integer)
    - `coincide` (boolean)
    - `observaciones` (text)
    - `fecha` (timestamptz)
    - `created_at` (timestamptz)

  ## 2. Seguridad
    - Habilitar RLS en todas las tablas
    - Políticas restrictivas basadas en roles
    - Acceso público de lectura para empleados sin autenticación
    - Acceso completo para administradores autenticados

  ## 3. Notas Importantes
    - Uso de valores por defecto apropiados
    - Constraints para integridad de datos
    - Índices para optimización de consultas
*/

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text UNIQUE NOT NULL,
  descripcion text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Tabla de ubicaciones
CREATE TABLE IF NOT EXISTS ubicaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL,
  pasillo text NOT NULL,
  nivel text NOT NULL,
  seccion text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clave text UNIQUE NOT NULL,
  nombre text NOT NULL,
  marca text DEFAULT '',
  tipo text DEFAULT '',
  cantidad integer DEFAULT 0 CHECK (cantidad >= 0),
  clasificacion text DEFAULT 'no frágil' CHECK (clasificacion IN ('frágil', 'no frágil')),
  categoria_id uuid REFERENCES categorias(id) ON DELETE SET NULL,
  ubicacion_id uuid REFERENCES ubicaciones(id) ON DELETE SET NULL,
  qr_url text DEFAULT '',
  fecha_actualizacion timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  rol text NOT NULL CHECK (rol IN ('admin', 'empleado')),
  nombre text NOT NULL,
  apellidos text DEFAULT '',
  email text UNIQUE NOT NULL,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Tabla de movimientos
CREATE TABLE IF NOT EXISTS movimientos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id uuid NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  usuario_id uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  tipo text NOT NULL CHECK (tipo IN ('entrada', 'salida', 'verificacion')),
  cantidad integer NOT NULL CHECK (cantidad > 0),
  observaciones text DEFAULT '',
  fecha timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Tabla de verificaciones de inventario
CREATE TABLE IF NOT EXISTS verificaciones_inventario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id uuid NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  cantidad_sistema integer NOT NULL,
  cantidad_fisica integer NOT NULL,
  coincide boolean DEFAULT false,
  observaciones text DEFAULT '',
  fecha timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_productos_clave ON productos(clave);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_productos_ubicacion ON productos(ubicacion_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_producto ON movimientos(producto_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_fecha ON movimientos(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_verificaciones_producto ON verificaciones_inventario(producto_id);

-- Habilitar RLS
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE ubicaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE verificaciones_inventario ENABLE ROW LEVEL SECURITY;

-- Políticas para categorias (lectura pública, escritura admin)
CREATE POLICY "Lectura pública de categorías"
  ON categorias FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Administradores pueden insertar categorías"
  ON categorias FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'admin'
      AND usuarios.activo = true
    )
  );

CREATE POLICY "Administradores pueden actualizar categorías"
  ON categorias FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'admin'
      AND usuarios.activo = true
    )
  );

CREATE POLICY "Administradores pueden eliminar categorías"
  ON categorias FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'admin'
      AND usuarios.activo = true
    )
  );

-- Políticas para ubicaciones (lectura pública, escritura admin)
CREATE POLICY "Lectura pública de ubicaciones"
  ON ubicaciones FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Administradores pueden insertar ubicaciones"
  ON ubicaciones FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'admin'
      AND usuarios.activo = true
    )
  );

CREATE POLICY "Administradores pueden actualizar ubicaciones"
  ON ubicaciones FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'admin'
      AND usuarios.activo = true
    )
  );

CREATE POLICY "Administradores pueden eliminar ubicaciones"
  ON ubicaciones FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'admin'
      AND usuarios.activo = true
    )
  );

-- Políticas para productos (lectura pública, escritura admin)
CREATE POLICY "Lectura pública de productos"
  ON productos FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Administradores pueden insertar productos"
  ON productos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'admin'
      AND usuarios.activo = true
    )
  );

CREATE POLICY "Administradores pueden actualizar productos"
  ON productos FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'admin'
      AND usuarios.activo = true
    )
  );

CREATE POLICY "Administradores pueden eliminar productos"
  ON productos FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'admin'
      AND usuarios.activo = true
    )
  );

-- Políticas para usuarios (solo admins pueden gestionar)
CREATE POLICY "Administradores pueden ver usuarios"
  ON usuarios FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'admin'
      AND usuarios.activo = true
    )
  );

CREATE POLICY "Administradores pueden insertar usuarios"
  ON usuarios FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'admin'
      AND usuarios.activo = true
    )
  );

CREATE POLICY "Administradores pueden actualizar usuarios"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'admin'
      AND usuarios.activo = true
    )
  );

CREATE POLICY "Usuarios pueden ver su propio perfil"
  ON usuarios FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Políticas para movimientos (lectura pública, escritura autenticada)
CREATE POLICY "Lectura pública de movimientos"
  ON movimientos FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar movimientos"
  ON movimientos FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Políticas para verificaciones (lectura pública, escritura autenticada)
CREATE POLICY "Lectura pública de verificaciones"
  ON verificaciones_inventario FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Usuarios pueden insertar verificaciones"
  ON verificaciones_inventario FOR INSERT
  TO public
  WITH CHECK (true);

-- Función para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION actualizar_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar fecha_actualizacion en productos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_actualizar_fecha_productos'
  ) THEN
    CREATE TRIGGER trigger_actualizar_fecha_productos
      BEFORE UPDATE ON productos
      FOR EACH ROW
      EXECUTE FUNCTION actualizar_fecha_modificacion();
  END IF;
END $$;

-- Datos iniciales de categorías
INSERT INTO categorias (nombre, descripcion) VALUES
  ('Herramientas Eléctricas', 'Herramientas con motor eléctrico'),
  ('Herramientas Manuales', 'Herramientas de uso manual'),
  ('Material de Construcción', 'Materiales para construcción'),
  ('Equipos de Seguridad', 'Equipos de protección personal')
ON CONFLICT (nombre) DO NOTHING;

-- Datos iniciales de ubicaciones
INSERT INTO ubicaciones (codigo, pasillo, nivel, seccion) VALUES
  ('A1-1', 'A1', 'Nivel 1', 'Sección A'),
  ('A1-2', 'A1', 'Nivel 2', 'Sección A'),
  ('B1-1', 'B1', 'Nivel 1', 'Sección B'),
  ('B2-1', 'B2', 'Nivel 1', 'Sección B')
ON CONFLICT (codigo) DO NOTHING;