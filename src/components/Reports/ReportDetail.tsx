import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { VerificacionInventario, Reporte } from '../../types';

interface Props {
    reporte: Reporte;
    onBack: () => void;
}

export function ReportDetail({ reporte, onBack }: Props) {
    const [detalles, setDetalles] = useState<VerificacionInventario[]>([]);

    useEffect(() => {
        loadDetalles();
    }, []);

    const loadDetalles = async () => {
        const { data, error} = await supabase
        .from('verificaciones_inventario')
        .select('*, producto:productos(nombre, clave)')
        .eq('reporte_id', reporte.id);

        if (error) {
            console.error(error);
            return;
        }

        setDetalles(data || []);
    };

    return (
        <div>
            <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver</span>
            </button>

            <h2 className="text-2xl font-bold mb-4">
                Reporte de {reporte.empleado_codigo}
            </h2>

            <p className="text-gray-500 mb-6">
                Fecha: {new Date(reporte.fecha).toLocaleString()}
            </p>

            <div className="space-y-4">
                {detalles.map((d) => (
                    <div
                    key={d.id}
                    className="bg-white shadow p-4 rounded-lg border"
                    >
                        <p className="font-bold">{d.producto?.nombre}</p>
                        <p>Clave: {d.producto?.clave}</p>
                        <p>Sistema: {d.cantidad_sistema}</p>
                        <p>Físico: {d.cantidad_fisica}</p>
                        <p className={d.coincide ? 'text-green-600': 'text-red-600'}>
                            {d.coincide ? 'Coincide' : 'No coincide'}
                        </p>
                        {d.observaciones && (
                            <p className="text-gray-500">Obs: {d.observaciones}</p>
                            )}
                            </div>
                ))}
                </div>
        </div>
    );
}