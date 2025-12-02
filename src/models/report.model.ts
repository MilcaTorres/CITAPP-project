import { VerificacionInventario } from '../types';

/**
 * DTO para crear una verificación de inventario
 */
export interface CreateVerificationDTO {
    producto_id: string;
    cantidad_sistema: number;
    cantidad_fisica: number;
    coincide: boolean;
    observaciones?: string;
    empleado_codigo?: string;
    reporte_id?: string;
}

/**
 * Reporte agrupado de verificaciones
 */
export interface ReporteSummary {
    id: string;
    empleado_codigo: string;
    fecha: string;
    total_productos: number;
    total_discrepancias: number;
    verificaciones: VerificacionInventario[];
}
