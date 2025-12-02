import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ArrowLeft, Calendar, Download, User } from 'lucide-react';
import { VerificacionInventario } from '../../types';

interface ReportDetailProps {
    reporte: {
        id: string;
        fecha: string;
        empleado_codigo: string;
        verificaciones: VerificacionInventario[];
    };
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
                // Colorear filas con discrepancias
                const rawRow = data.row.raw as string[];
                if (data.section === 'body' && rawRow[4] === 'Discrepancia') {
                    data.cell.styles.fillColor = [254, 226, 226]; // Light red
                    data.cell.styles.textColor = [185, 28, 28]; // Dark red
                }
            }
        });

        doc.save(`Reporte_${reporte.id}_${reporte.fecha.split('T')[0]}.pdf`);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
                <button
                    onClick={onBack}
                    className="flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-6"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    <span>Volver</span>
                </button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Reporte {reporte.id}
                        </h1>
                        <div className="flex items-center space-x-6 text-gray-600">
                            <div className="flex items-center">
                                <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                                <span className="font-medium">{new Date(reporte.fecha).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center">
                                <User className="w-5 h-5 mr-2 text-gray-400" />
                                <span>Empleado: <span className="font-mono font-bold text-gray-900">{reporte.empleado_codigo}</span></span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleExportPDF}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        <span>Exportar PDF</span>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="p-6">
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-red-500 text-white">
                                <th className="py-4 px-6 font-semibold text-sm uppercase tracking-wider">Producto</th>
                                <th className="py-4 px-6 font-semibold text-sm uppercase tracking-wider text-center">En Sistema</th>
                                <th className="py-4 px-6 font-semibold text-sm uppercase tracking-wider text-center">En Físico</th>
                                <th className="py-4 px-6 font-semibold text-sm uppercase tracking-wider">Observaciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {reporte.verificaciones.map((verificacion) => {
                                const coincide = verificacion.cantidad_sistema === verificacion.cantidad_fisica;
                                return (
                                    <tr
                                        key={verificacion.id}
                                        className={`hover:bg-gray-50 transition-colors ${!coincide ? 'bg-red-50' : ''}`}
                                    >
                                        <td className="py-4 px-6">
                                            <div className="font-medium text-gray-900">
                                                {verificacion.producto?.nombre || 'Producto Desconocido'}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Clave: {verificacion.producto?.clave}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-800 font-medium">
                                                {verificacion.cantidad_sistema}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className={`inline-block px-3 py-1 rounded-full font-medium ${coincide
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {verificacion.cantidad_fisica}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-600 italic">
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