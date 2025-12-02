import { AlertTriangle, Calendar, CheckCircle, ClipboardList, User } from 'lucide-react';
import type { ReporteSummary } from '../../models/report.model';

interface ReportCardProps {
    reporte: ReporteSummary;
    onClick: () => void;
}

export function ReportCard({ reporte, onClick }: ReportCardProps) {
    const hasIncidents = reporte.total_discrepancias > 0;

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-all border border-gray-100 hover:border-blue-200 group"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg ${hasIncidents ? 'bg-orange-100' : 'bg-blue-100'}`}>
                        <ClipboardList className={`w-6 h-6 ${hasIncidents ? 'text-orange-600' : 'text-blue-600'}`} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            Reporte {reporte.id}
                        </h3>
                    </div>
                </div>
                {hasIncidents ? (
                    <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full flex items-center font-medium">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {reporte.total_discrepancias} Incidencias
                    </span>
                ) : (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center font-medium">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Correcto
                    </span>
                )}
            </div>

            <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{new Date(reporte.fecha).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <span>Empleado: <span className="font-mono font-medium text-gray-900">{reporte.empleado_codigo}</span></span>
                </div>
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-sm text-gray-500">Productos verificados</span>
                    <span className="font-bold text-gray-900">{reporte.total_productos}</span>
                </div>
            </div>
        </div>
    );
}