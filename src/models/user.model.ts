
/**
 * DTO para crear un nuevo usuario
 */
export interface CreateUserDTO {
    id: string; // Auth user ID from Supabase
    rol: 'admin' | 'empleado';
    nombre: string;
    apellidos: string;
    email: string;
    activo?: boolean;
}

/**
 * DTO para actualizar un usuario
 */
export interface UpdateUserDTO {
    nombre?: string;
    apellidos?: string;
    rol?: 'admin' | 'empleado';
    activo?: boolean;
}

/**
 * Filtros para búsqueda de usuarios
 */
export interface UserFilters {
    rol?: 'admin' | 'empleado';
    activo?: boolean;
    search?: string;
}
