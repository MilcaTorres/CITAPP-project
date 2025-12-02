import { supabase } from '../lib/supabase';
import type { CreateUserDTO, UpdateUserDTO, UserFilters } from '../models/user.model';
import type { Usuario } from '../types';
import { AppError } from '../utils/error-handler';

/**
 * Servicio para gestión de usuarios
 */
export class UserService {
    /**
     * Obtiene todos los usuarios con filtros opcionales
     */
    static async getAll(filters?: UserFilters): Promise<Usuario[]> {
        try {
            let query = supabase
                .from('usuarios')
                .select('*')
                .order('created_at', { ascending: false });

            if (filters?.rol) {
                query = query.eq('rol', filters.rol);
            }

            if (filters?.activo !== undefined) {
                query = query.eq('activo', filters.activo);
            }

            if (filters?.search) {
                query = query.or(
                    `nombre.ilike.%${filters.search}%,` +
                    `apellidos.ilike.%${filters.search}%,` +
                    `email.ilike.%${filters.search}%`
                );
            }

            const { data, error } = await query;

            if (error) {
                throw new AppError('Error al cargar usuarios', error);
            }

            return data || [];
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error inesperado al cargar usuarios', error);
        }
    }

    /**
     * Obtiene un usuario por su ID
     */
    static async getById(id: string): Promise<Usuario> {
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                throw new AppError('Error al cargar el usuario', error);
            }

            if (!data) {
                throw new AppError('Usuario no encontrado');
            }

            return data;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error inesperado al cargar el usuario', error);
        }
    }

    /**
     * Crea un nuevo usuario
     */
    static async create(userData: CreateUserDTO): Promise<Usuario> {
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .insert([userData])
                .select()
                .single();

            if (error) {
                throw new AppError('Error al crear el usuario', error);
            }

            return data;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error inesperado al crear el usuario', error);
        }
    }

    /**
     * Actualiza un usuario existente
     */
    static async update(id: string, userData: UpdateUserDTO): Promise<Usuario> {
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .update(userData)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new AppError('Error al actualizar el usuario', error);
            }

            return data;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error inesperado al actualizar el usuario', error);
        }
    }

    /**
     * Elimina (desactiva) un usuario
     */
    static async deactivate(id: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('usuarios')
                .update({ activo: false })
                .eq('id', id);

            if (error) {
                throw new AppError('Error al desactivar el usuario', error);
            }
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error inesperado al desactivar el usuario', error);
        }
    }

    /**
     * Activa un usuario
     */
    static async activate(id: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('usuarios')
                .update({ activo: true })
                .eq('id', id);

            if (error) {
                throw new AppError('Error al activar el usuario', error);
            }
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error inesperado al activar el usuario', error);
        }
    }

    /**
     * Obtiene todos los administradores activos
     */
    static async getActiveAdmins(): Promise<Usuario[]> {
        return this.getAll({ rol: 'admin', activo: true });
    }
}
