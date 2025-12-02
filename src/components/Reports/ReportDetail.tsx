import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ArrowLeft, Calendar, Download, User } from 'lucide-react';
import type { ReporteSummary } from '../../models/report.model';

interface ReportDetailProps {
    reporte: ReporteSummary;
    onBack: () => void;
}

export function ReportDetail({ reporte, onBack }: ReportDetailProps) {

    const handleExportPDF = () => {
        const doc = new jsPDF();

        // Encabezado
        doc.setFontSize(20);
        doc.text(`Reporte de Inventario ${reporte.id}`, 14, 22);

        doc.setFontSize(10);
        doc.text(`Fecha: ${new Date(reporte.fecha).toLocaleDateString()}`, 14, 30);
        doc.text(`Empleado: ${reporte.empleado_codigo}`, 14, 35);

        // Tabla
        const tableData = reporte.verificaciones.map(v => [
            v.producto?.nombre || 'Desconocido',
            v.producto?.clave || '-',
            v.cantidad_sistema,
            v.cantidad_fisica,
            v.cantidad_sistema === v.cantidad_fisica ? 'Correcto' : 'Discrepancia',
            v.observaciones || '-'
        ]);

        autoTable(doc, {
            startY: 45,
            head: [['Producto', 'Clave', 'Sistema', 'Físico', 'Estado', 'Observaciones']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [220, 38, 38] }, // Red header to match UI
            styles: { fontSize: 8 },
            columnStyles: {
                0: { cellWidth: 40 }, // Producto
                5: { cellWidth: 50 }  // Observaciones
            },
            didParseCell: (data) => {
                if (data.section === 'body' && data.column.index === 4) {
                    const isDiscrepancy = data.cell.raw === 'Discrepancia';
                    if (isDiscrepancy) {
                        data.cell.styles.textColor = [220, 38, 38];
                        data.cell.styles.fontStyle = 'bold';
                    }
                }
            }
        });

        doc.save(`Reporte_${reporte.id}_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-300" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            Reporte {reporte.id}
                        </h1>
                        <div className="flex items-center space-x-6 mt-2 text-sm text-gray-300">
                            <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span>{new Date(reporte.fecha).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center">
                                <User className="w-4 h-4 mr-2" />
                                <span>Empleado: <span className="font-mono font-medium text-white">{reporte.empleado_codigo}</span></span>
                            </div>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleExportPDF}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                    <Download className="w-5 h-5" />
                    <span>Exportar PDF</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-600 font-medium">Total Productos</p>
                    <p className="text-2xl font-bold text-blue-900">{reporte.total_productos}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-green-600 font-medium">Sin Discrepancias</p>
                    <p className="text-2xl font-bold text-green-900">
                        {reporte.total_productos - reporte.total_discrepancias}
                    </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <p className="text-sm text-orange-600 font-medium">Con Discrepancias</p>
                    <p className="text-2xl font-bold text-orange-900">{reporte.total_discrepancias}</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-red-600">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Producto
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Clave
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Sistema
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Físico
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Observaciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reporte.verificaciones.map((verificacion, index) => {
                                const isDiscrepancy = verificacion.cantidad_sistema !== verificacion.cantidad_fisica;
                                return (
                                    <tr key={index} className={isDiscrepancy ? 'bg-orange-50' : ''}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {verificacion.producto?.nombre || 'Desconocido'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                            {verificacion.producto?.clave || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {verificacion.cantidad_sistema}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {verificacion.cantidad_fisica}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {isDiscrepancy ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                    Discrepancia
                                                </span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    Correcto
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {verificacion.observaciones || '-'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}