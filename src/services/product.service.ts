import { supabase } from '../lib/supabase';
import type {
    CreateProductDTO,
    ProductFilters,
    ProductWithRelations,
    UpdateProductDTO
} from '../models/product.model';
import { validateProductData } from '../models/product.model';
import type { Producto } from '../types';
import { AppError } from '../utils/error-handler';

/**
 * Servicio para gestión de productos
 * Centraliza toda la lógica de negocio relacionada con productos
 */
export class ProductService {
    /**
     * Obtiene todos los productos con sus relaciones
     */
    static async getAll(filters?: ProductFilters): Promise<ProductWithRelations[]> {
        try {
            let query = supabase
                .from('productos')
                .select(`
                    *,
                    categoria:categorias(*),
                    ubicacion:ubicaciones(*)
                `)
                .order('created_at', { ascending: false });

            // Aplicar filtros
            if (filters?.search) {
                query = query.or(
                    `nombre.ilike.%${filters.search}%,` +
                    `clave.ilike.%${filters.search}%,` +
                    `marca.ilike.%${filters.search}%`
                );
            }

            if (filters?.categoria_id) {
                query = query.eq('categoria_id', filters.categoria_id);
            }

            if (filters?.ubicacion_id) {
                query = query.eq('ubicacion_id', filters.ubicacion_id);
            }

            if (filters?.clasificacion) {
                query = query.eq('clasificacion', filters.clasificacion);
            }

            const { data, error } = await query;

            if (error) {
                throw new AppError('Error al cargar productos', error);
            }

            return data as ProductWithRelations[];
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error inesperado al cargar productos', error);
        }
    }

    /**
     * Obtiene un producto por su ID
     */
    static async getById(id: string): Promise<ProductWithRelations> {
        try {
            const { data, error } = await supabase
                .from('productos')
                .select(`
                    *,
                    categoria:categorias(*),
                    ubicacion:ubicaciones(*)
                `)
                .eq('id', id)
                .single();

            if (error) {
                throw new AppError('Error al cargar el producto', error);
            }

            if (!data) {
                throw new AppError('Producto no encontrado');
            }

            return data as ProductWithRelations;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error inesperado al cargar el producto', error);
        }
    }

    /**
     * Crea un nuevo producto
     */
    static async create(productData: CreateProductDTO): Promise<Producto> {
        try {
            // Validar datos
            const validationErrors = validateProductData(productData);
            if (validationErrors.length > 0) {
                throw new AppError(validationErrors.join(', '));
            }

            const { data, error } = await supabase
                .from('productos')
                .insert([productData])
                .select()
                .single();

            if (error) {
                throw new AppError('Error al crear el producto', error);
            }

            return data;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error inesperado al crear el producto', error);
        }
    }

    /**
     * Actualiza un producto existente
     */
    static async update(id: string, productData: UpdateProductDTO): Promise<Producto> {
        try {
            // Validar datos
            const validationErrors = validateProductData(productData);
            if (validationErrors.length > 0) {
                throw new AppError(validationErrors.join(', '));
            }

            const { data, error } = await supabase
                .from('productos')
                .update(productData)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new AppError('Error al actualizar el producto', error);
            }

            return data;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error inesperado al actualizar el producto', error);
        }
    }

    /**
     * Elimina un producto
     */
    static async delete(id: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('productos')
                .delete()
                .eq('id', id);

            if (error) {
                throw new AppError('Error al eliminar el producto', error);
            }
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error inesperado al eliminar el producto', error);
        }
    }

    /**
     * Genera o actualiza el código QR de un producto
     */
    static async generateQR(id: string): Promise<string> {
        try {
            // La URL a la que apuntará el QR (vista pública del producto)
            const targetUrl = `${window.location.origin}/empleado/${id}`;

            // Generar la URL de la IMAGEN del QR usando una API pública
            // Esto es necesario porque <img src="..."> espera una imagen, no una página web
            const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(targetUrl)}`;

            // Actualizar el producto con la URL de la IMAGEN del QR
            const { error } = await supabase
                .from('productos')
                .update({ qr_url: qrImageUrl })
                .eq('id', id);

            if (error) {
                throw new AppError('Error al generar el código QR', error);
            }

            return qrImageUrl;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error inesperado al generar el código QR', error);
        }
    }

    /**
     * Busca productos por término de búsqueda
     */
    static async search(searchTerm: string): Promise<ProductWithRelations[]> {
        return this.getAll({ search: searchTerm });
    }
}
