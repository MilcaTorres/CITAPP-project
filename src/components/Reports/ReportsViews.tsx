import { FileText, Loader, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { VerificacionInventario } from '../../types';
import { ReportCard } from './ReportCard';
import { ReportDetail } from './ReportDetail';

interface GroupedReport {
    id: string; // Generado basado en fecha+empleado
    fecha: string;
    empleado_codigo: string;
    total_productos: number;
    con_incidencias: number;
    verificaciones: VerificacionInventario[];
}

export function ReportsView() {
    const [reportes, setReportes] = useState<GroupedReport[]>([]);
    const [filtered, setFiltered] = useState<GroupedReport[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedReport, setSelectedReport] = useState<GroupedReport | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReportes();
    }, []);

    useEffect(() => {
        const f = reportes.filter((r) =>
            r.empleado_codigo.includes(searchTerm) ||
            r.fecha.includes(searchTerm)
        );
        setFiltered(f);
    }, [searchTerm, reportes]);

    const loadReportes = async () => {
        try {
            setLoading(true);
            // 1. Obtener todas las verificaciones con datos del producto
            const { data, error } = await supabase
                .from('verificaciones_inventario')
                .select(`
                    *,
                    producto:productos(nombre, clave)
                `)
                .order('fecha', { ascending: false });

            if (error) throw error;

            const verificaciones = (data || []) as VerificacionInventario[];

            // 2. Agrupar por fecha (DD-MM-YYYY) y código de empleado
            const grupos: { [key: string]: GroupedReport } = {};

            verificaciones.forEach(v => {
                const dateObj = new Date(v.fecha);
                const fechaStr = dateObj.toLocaleDateString('en-CA'); // YYYY-MM-DD para ordenamiento
                const key = `${fechaStr}-${v.empleado_codigo}`;

                if (!grupos[key]) {
                    grupos[key] = {
                        id: '', // Se generará después
                        fecha: v.fecha,
                        empleado_codigo: v.empleado_codigo || 'Desconocido',
                        total_productos: 0,
                        con_incidencias: 0,
                        verificaciones: []
                    };
                }

                grupos[key].verificaciones.push(v);
                grupos[key].total_productos++;
                if (v.cantidad_sistema !== v.cantidad_fisica) {
                    grupos[key].con_incidencias++;
                }
            });

            // 3. Convertir a array, ordenar por fecha ascendente para asignar IDs consecutivos
            let reportesArray = Object.values(grupos).sort((a, b) =>
                new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
            );

            // Asignar IDs secuenciales (1, 2, 3...)
            reportesArray = reportesArray.map((reporte, index) => ({
                ...reporte,
                id: (index + 1).toString()
            }));

            // Ordenar descendente para mostrar los más recientes primero
            reportesArray.reverse();

            setReportes(reportesArray);
        } catch (error) {
            console.error('Error cargando reportes:', error);
        } finally {
            setLoading(false);
        }
    };

    if (selectedReport) {
        return (
            <ReportDetail
                reporte={selectedReport}
                onBack={() => setSelectedReport(null)}
            />
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">REPORTES</h1>
                    <p className="text-gray-500 mt-1">Historial de verificaciones agrupado por empleado</p>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por código de empleado o fecha..."
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-lg"
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No se encontraron reportes</h3>
                    <p className="text-gray-500">Intenta ajustar tu búsqueda</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((r) => (
                        <ReportCard
                            key={r.id}
                            reporte={r}
                            onClick={() => setSelectedReport(r)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}