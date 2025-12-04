import { supabase } from '../lib/supabase';
import type { CreateVerificationDTO, ReporteSummary } from '../models/report.model';
import type { VerificacionInventario } from '../types';
import { AppError } from '../utils/error-handler';

/**
 * Servicio para gestión de reportes e inventario
 */
export class ReportService {
    /**
     * Crea una nueva verificación de inventario
     */
    static async createVerification(verificationData: CreateVerificationDTO): Promise<VerificacionInventario> {
        try {
            const { data, error } = await supabase
                .from('verificaciones_inventario')
                .insert([verificationData])
                .select()
                .single();

            if (error) {
                throw new AppError('Error al crear la verificación', error);
            }

            return data;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error inesperado al crear la verificación', error);
        }
    }

    /**
     * Obtiene todos los reportes agrupados por empleado y día
     */
    static async getAllReports(): Promise<ReporteSummary[]> {
        try {
            const { data, error } = await supabase
                .from('verificaciones_inventario')
                .select(`
                    *,
                    producto:productos(*)
                `)
                .order('fecha', { ascending: false });

            if (error) {
                throw new AppError('Error al cargar reportes', error);
            }

            // Agrupar por empleado_codigo y fecha (solo día, sin hora)
            const grupos: { [key: string]: ReporteSummary } = {};

            (data || []).forEach((verificacion) => {
                // Extraer solo la fecha (YYYY-MM-DD) sin la hora
                const fecha = new Date(verificacion.fecha);
                const fechaSolodia = fecha.toISOString().split('T')[0]; // "2024-12-04"

                // Clave única: empleado + fecha del día
                const key = `${verificacion.empleado_codigo || 'sin_codigo'}_${fechaSolodia}`;

                if (!grupos[key]) {
                    grupos[key] = {
                        id: key,
                        empleado_codigo: verificacion.empleado_codigo || 'Sin código',
                        fecha: fechaSolodia, // Guardar solo la fecha del día
                        total_productos: 0,
                        total_discrepancias: 0,
                        verificaciones: []
                    };
                }

                grupos[key].total_productos++;
                if (!verificacion.coincide) {
                    grupos[key].total_discrepancias++;
                }
                grupos[key].verificaciones.push(verificacion);
            });

            // Convertir a array y ordenar por fecha (más recientes primero)
            let reportesArray = Object.values(grupos).sort((a, b) =>
                new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
            );

            // Asignar IDs secuenciales para mejor visualización
            reportesArray = reportesArray.map((reporte, index) => ({
                ...reporte,
                id: (index + 1).toString()
            }));

            return reportesArray;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error inesperado al cargar reportes', error);
        }
    }

    /**
     * Obtiene un reporte específico por ID
     */
    static async getReportById(id: string): Promise<ReporteSummary | null> {
        try {
            const reports = await this.getAllReports();
            return reports.find(r => r.id === id) || null;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error inesperado al cargar el reporte', error);
        }
    }

    /**
     * Obtiene verificaciones por producto
     */
    static async getVerificationsByProduct(productId: string): Promise<VerificacionInventario[]> {
        try {
            const { data, error } = await supabase
                .from('verificaciones_inventario')
                .select('*')
                .eq('producto_id', productId)
                .order('fecha', { ascending: false });

            if (error) {
                throw new AppError('Error al cargar verificaciones', error);
            }

            return data || [];
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error inesperado al cargar verificaciones', error);
        }
    }
}
