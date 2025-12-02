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
     * Obtiene todos los reportes agrupados
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

            // Agrupar por reporte_id y empleado_codigo
            const grupos: { [key: string]: ReporteSummary } = {};

            (data || []).forEach((verificacion) => {
                const key = `${verificacion.empleado_codigo}_${verificacion.reporte_id || 'sin_reporte'}`;

                if (!grupos[key]) {
                    grupos[key] = {
                        id: verificacion.reporte_id || key,
                        empleado_codigo: verificacion.empleado_codigo || 'Sin código',
                        fecha: verificacion.fecha,
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

            // Convertir a array y ordenar
            let reportesArray = Object.values(grupos).sort((a, b) =>
                new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
            );

            // Asignar IDs secuenciales
            reportesArray = reportesArray.map((reporte, index) => ({
                ...reporte,
                id: (index + 1).toString()
            }));

            // Ordenar descendente para mostrar los más recientes primero
            reportesArray.reverse();

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
