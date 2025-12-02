import { Producto } from '../types';

/**
 * DTO para crear un nuevo producto
 */
export interface CreateProductDTO {
    clave: string;
    nombre: string;
    marca?: string;
    tipo?: string;
    cantidad: number;
    clasificacion: 'frágil' | 'no frágil';
    categoria_id?: string;
    ubicacion_id?: string;
}

/**
 * DTO para actualizar un producto existente
 */
export interface UpdateProductDTO {
    clave?: string;
    nombre?: string;
    marca?: string;
    tipo?: string;
    cantidad?: number;
    clasificacion?: 'frágil' | 'no frágil';
    categoria_id?: string;
    ubicacion_id?: string;
}

/**
 * Filtros para búsqueda de productos
 */
export interface ProductFilters {
    search?: string;
    categoria_id?: string;
    ubicacion_id?: string;
    clasificacion?: 'frágil' | 'no frágil';
}

/**
 * Respuesta de producto con relaciones
 */
export interface ProductWithRelations extends Omit<Producto, 'categoria' | 'ubicacion'> {
    categoria?: {
        id: string;
        nombre: string;
        descripcion?: string;
        created_at: string;
    };
    ubicacion?: {
        id: string;
        codigo: string;
        pasillo: string;
        nivel: string;
        seccion?: string;
        created_at: string;
    };
}

/**
 * Valida los datos de un producto antes de crear/actualizar
 */
export const validateProductData = (data: Partial<CreateProductDTO>): string[] => {
    const errors: string[] = [];

    if (!data.clave || data.clave.trim() === '') {
        errors.push('La clave es requerida');
    }

    if (!data.nombre || data.nombre.trim() === '') {
        errors.push('El nombre es requerido');
    }

    if (data.cantidad !== undefined && data.cantidad < 0) {
        errors.push('La cantidad no puede ser negativa');
    }

    if (data.clasificacion && !['frágil', 'no frágil'].includes(data.clasificacion)) {
        errors.push('La clasificación debe ser "frágil" o "no frágil"');
    }

    return errors;
};
