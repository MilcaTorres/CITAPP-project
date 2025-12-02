import { FileText } from 'lucide-react';
import { Reporte } from '../../types';

interface Props {
    reporte: Reporte;
    onClick: () => void;
}

export function ReportCard({ reporte, onClick}: Props) {
    return (
        <div
        onClick={onClick}
        className="bg-white shadow-md p-6 rounded-lg cursor-pointer hover:shadow-lg transition"
        >
            <div className="flex items-center space-x-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                    <FileText className="w-8 h-8 text-gray-600" />
                </div>

                <div>
                    <h3 className="font-bold text-gray-900">Reporte #{reporte.id.slice(0, 6)}</h3>
                    <p className="text-gray-600">Empleado: {reporte.empleado_codigo}</p>
                    <p className="text-gray-400 text-sm">{new Date(reporte.fecha).toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    );
}