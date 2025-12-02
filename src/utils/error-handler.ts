/**
 * Custom Application Error
 * Centraliza el manejo de errores en toda la aplicación
 */
export class AppError extends Error {
    constructor(
        public message: string,
        public originalError?: any,
        public code?: string
    ) {
        super(message);
        this.name = 'AppError';
    }

    /**
     * Obtiene un mensaje de error amigable para el usuario
     */
    getUserMessage(): string {
        // Mapeo de errores comunes de Supabase
        if (this.originalError?.code === '23505') {
            return 'Ya existe un registro con esos datos';
        }
        if (this.originalError?.code === '23503') {
            return 'No se puede eliminar porque está siendo usado';
        }
        if (this.originalError?.message?.includes('JWT')) {
            return 'Sesión expirada. Por favor, inicia sesión nuevamente';
        }

        return this.message;
    }

    /**
     * Determina si el error debe mostrarse al usuario
     */
    isUserFacing(): boolean {
        return true;
    }
}

/**
 * Maneja errores de forma consistente
 */
export const handleError = (error: any): AppError => {
    console.error('Error capturado:', error);

    if (error instanceof AppError) {
        return error;
    }

    // Error de Supabase
    if (error?.message && error?.code) {
        return new AppError(
            'Error en la operación',
            error,
            error.code
        );
    }

    // Error genérico
    return new AppError(
        error?.message || 'Error inesperado',
        error
    );
};
