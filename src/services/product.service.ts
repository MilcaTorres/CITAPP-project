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
 * Normaliza un texto para comparación case-insensitive
 */
function normalizeText(value?: string | null): string {
    if (!value) return '';
    return value.trim().toLowerCase();
}

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
     * Crea un nuevo producto O actualiza la cantidad si ya existe
     * OPCIÓN 2: Búsqueda por nombre+marca+tipo (NO usar UNIQUE constraint en clave)
     */
    static async create(productData: CreateProductDTO): Promise<Producto> {
        console.log('⭐⭐⭐ ProductService.create LLAMADO ⭐⭐⭐', productData);
        try {
            // Validar datos
            const validationErrors = validateProductData(productData);
            if (validationErrors.length > 0) {
                throw new AppError(validationErrors.join(', '));
            }

            if (!productData.nombre?.trim()) {
                throw new AppError('El nombre del producto es requerido');
            }

            // Normalizar para comparación
            const nombreNorm = normalizeText(productData.nombre);
            const marcaNorm = normalizeText(productData.marca);
            const tipoNorm = normalizeText(productData.tipo);

            console.log('🔍 NORMALIZANDO PRODUCTO:');
            console.log('  Input:', { nombre: productData.nombre, marca: productData.marca, tipo: productData.tipo });
            console.log('  Normalizado:', { nombreNorm, marcaNorm, tipoNorm });

            // 1) Obtener TODOS los productos (limitado a nombre similar)
            const { data: allProducts, error: searchError } = await supabase
                .from('productos')
                .select('*');

            if (searchError) {
                throw new AppError('Error buscando productos existentes', searchError);
            }

            console.log(`📦 Total productos en BD: ${allProducts?.length || 0}`);

            // 2) Filtrar en memoria por coincidencia exacta (case-insensitive)
            const existingProduct = allProducts?.find(product => {
                const prodNombre = normalizeText(product.nombre);
                const prodMarca = normalizeText(product.marca);
                const prodTipo = normalizeText(product.tipo);

                // Comparación: nombre SIEMPRE + marca + tipo
                const nombreMatch = prodNombre === nombreNorm;
                const marcaMatch = prodMarca === marcaNorm;
                const tipoMatch = prodTipo === tipoNorm;

                const matches = nombreMatch && marcaMatch && tipoMatch;

                if (nombreMatch) {
                    console.log(`  🔎 Comparando con "${product.nombre}" (ID: ${product.id}):`);
                    console.log(`     Nombre: "${prodNombre}" === "${nombreNorm}" → ${nombreMatch}`);
                    console.log(`     Marca:  "${prodMarca}" === "${marcaNorm}" → ${marcaMatch}`);
                    console.log(`     Tipo:   "${prodTipo}" === "${tipoNorm}" → ${tipoMatch}`);
                    console.log(`     MATCH TOTAL: ${matches}`);
                }

                return matches;
            });

            console.log(existingProduct ? `✅ DUPLICADO ENCONTRADO: ${existingProduct.id}` : '🆕 NO HAY DUPLICADOS, CREAR NUEVO');

            if (existingProduct) {
                // 3) Ya existe → actualizar cantidad
                const cantidadActual = existingProduct.cantidad ?? 0;
                const cantidadNueva = productData.cantidad ?? 0;
                const nuevaCantidad = cantidadActual + cantidadNueva;

                const { data: updated, error: updateError } = await supabase
                    .from('productos')
                    .update({
                        cantidad: nuevaCantidad,
                        fecha_actualizacion: new Date().toISOString()
                    })
                    .eq('id', existingProduct.id)
                    .select()
                    .single();

                if (updateError) {
                    throw new AppError(
                        'Error al actualizar la cantidad del producto existente',
                        updateError
                    );
                }

                return updated as Producto;
            }

            // 4) No existe → crear producto nuevo
            const claveTrim = productData.clave?.trim();
            if (!claveTrim) {
                throw new AppError('La clave es requerida para un nuevo producto');
            }

            const { data, error } = await supabase
                .from('productos')
                .insert([{
                    ...productData,
                    clave: claveTrim,
                    nombre: productData.nombre.trim(),
                    marca: productData.marca?.trim() || null,
                    tipo: productData.tipo?.trim() || null
                }])
                .select()
                .single();

            if (error) {
                throw new AppError('Error al crear el producto', error);
            }

            return data as Producto;
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

            return data as Producto;
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
            const targetUrl = `${window.location.origin}/empleado/${id}`;

            const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                targetUrl
            )}`;

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