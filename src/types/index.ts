export interface Producto {
  id: string;
  clave: string;
  nombre: string;
  marca: string;
  tipo: string;
  cantidad: number;
  clasificacion: 'frágil' | 'no frágil';
  categoria_id: string | null;
  ubicacion_id: string | null;
  qr_url: string;
  fecha_actualizacion: string;
  created_at: string;
  categoria?: Categoria;
  ubicacion?: Ubicacion;
}

export interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  created_at: string;
}

export interface Ubicacion {
  id: string;
  codigo: string;
  pasillo: string;
  nivel: string;
  seccion: string;
  created_at: string;
}

export interface Usuario {
  id: string;
  rol: 'admin' | 'empleado';
  nombre: string;
  apellidos: string;
  email: string;
  activo: boolean;
  created_at: string;
}

export interface Movimiento {
  id: string;
  producto_id: string;
  usuario_id: string | null;
  tipo: 'entrada' | 'salida' | 'verificacion';
  cantidad: number;
  observaciones: string;
  fecha: string;
  created_at: string;
  producto?: Producto;
  usuario?: Usuario;
}

export interface VerificacionInventario {
  id: string;
  producto_id: string;
  cantidad_sistema: number;
  cantidad_fisica: number;
  coincide: boolean;
  observaciones: string;
  fecha: string;
  created_at: string;
  producto?: Producto;
}
