import { supabase } from '../lib/supabase';
import type { Usuario } from '../types';
import { AppError } from '../utils/error-handler';

/**
 * Servicio para gestión de autenticación
 */
export class AuthService {
    /**
     * Inicia sesión con email y contraseña
     */
    static async signIn(email: string, password: string): Promise<{ user: any; usuario: Usuario | null }> {
        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (authError) {
                throw new AppError('Credenciales inválidas', authError);
            }

            // Obtener datos del usuario de la tabla usuarios
            const { data: userData, error: userError } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', authData.user.id)
                .single();

            if (userError && userError.code !== 'PGRST116') {
                throw new AppError('Error al cargar datos del usuario', userError);
            }

            return {
                user: authData.user,
                usuario: userData
            };
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error al iniciar sesión', error);
        }
    }

    /**
     * Inicia sesión con Google
     */
    static async signInWithGoogle(): Promise<void> {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard`
                }
            });

            if (error) {
                throw new AppError('Error al iniciar sesión con Google', error);
            }
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error al iniciar sesión con Google', error);
        }
    }

    /**
     * Cierra la sesión actual
     */
    static async signOut(): Promise<void> {
        try {
            const { error } = await supabase.auth.signOut();

            if (error) {
                throw new AppError('Error al cerrar sesión', error);
            }
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error al cerrar sesión', error);
        }
    }

    /**
     * Solicita recuperación de contraseña
     */
    static async requestPasswordRecovery(email: string, code: string): Promise<boolean> {
        try {
            const { data, error } = await supabase.rpc('request_password_recovery', {
                user_email: email,
                code: code
            });

            if (error) {
                throw new AppError('Error al solicitar recuperación', error);
            }

            return data;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error al solicitar recuperación de contraseña', error);
        }
    }

    /**
     * Restablece la contraseña con código
     */
    static async resetPasswordWithCode(email: string, code: string, newPassword: string): Promise<boolean> {
        try {
            const { data, error } = await supabase.rpc('reset_password_with_code', {
                user_email: email,
                code: code,
                new_password: newPassword
            });

            if (error) {
                throw new AppError('Error al restablecer contraseña', error);
            }

            return data;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error al restablecer contraseña', error);
        }
    }

    /**
     * Obtiene el usuario actual autenticado
     */
    static async getCurrentUser(): Promise<{ user: any; usuario: Usuario | null }> {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            // Si hay error o no hay usuario, retornar null
            if (authError || !user) {
                // Solo loguear si es un error real y no solo falta de sesión
                if (authError) console.log('No hay sesión activa');
                return { user: null, usuario: null };
            }

            // Si hay usuario, intentar obtener datos de la tabla usuarios
            const { data: userData, error: userError } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

            // Si hay error obteniendo usuario de la tabla, solo loguearlo pero retornar el user de auth
            if (userError && userError.code !== 'PGRST116') {
                console.warn('Error al cargar datos del usuario:', userError);
            }

            return {
                user,
                usuario: userData
            };
        } catch (error) {
            // En caso de cualquier error inesperado, retornar null en lugar de lanzar
            console.log('Error al obtener usuario actual:', error);
            return { user: null, usuario: null };
        }
    }
}
