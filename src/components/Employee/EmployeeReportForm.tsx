import { AlertCircle, CheckCircle, Loader, X } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Producto } from '../../types';
import { sanitizeObservations } from '../../utils/formValidation';

interface EmployeeReportFormProps {
    producto: Producto;
    onClose: () => void;
    onSuccess: () => void;
}

export function EmployeeReportForm({ producto, onClose, onSuccess }: EmployeeReportFormProps) {
    // Formulario para reporte de empleados
    const [cantidadFisica, setCantidadFisica] = useState<string>('');
    const [observaciones, setObservaciones] = useState('');
    const [codigoEmpleado, setCodigoEmpleado] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        // Validaciones
        if (!codigoEmpleado.trim()) {
            setError('Por favor ingresa tu código de empleado');
            return;
        }

        if (!/^\d{5}$/.test(codigoEmpleado)) {
            setError('El código de empleado debe ser de 5 dígitos');
            return;
        }

        if (!cantidadFisica.trim()) {
            setError('Por favor ingresa la cantidad física encontrada');
            return;
        }

        const cantidadFisicaNum = parseInt(cantidadFisica);
        if (isNaN(cantidadFisicaNum) || cantidadFisicaNum < 0) {
            setError('La cantidad física debe ser un número válido mayor o igual a 0');
            return;
        }

        try {
            setLoading(true);

            // Verificar que el código de empleado existe y está activo
            const { data: empleado, error: empleadoError } = await supabase
                .from('usuarios')
                .select('codigo, activo, rol')
                .eq('codigo', codigoEmpleado)
                .eq('rol', 'empleado')
                .single();

            if (empleadoError || !empleado) {
                setError('Código de empleado no válido');
                setLoading(false);
                return;
            }

            if (!empleado.activo) {
                setError('Tu cuenta de empleado está desactivada. Contacta al administrador.');
                setLoading(false);
                return;
            }

            // Calcular si coincide
            const coincide = producto.cantidad === cantidadFisicaNum;

            // Insertar verificación
            const { error: insertError } = await supabase
                .from('verificaciones_inventario')
                .insert({
                    producto_id: producto.id,
                    cantidad_sistema: producto.cantidad,
                    cantidad_fisica: cantidadFisicaNum,
                    coincide,
                    observaciones: observaciones.trim(),
                    empleado_codigo: codigoEmpleado,
                    fecha: new Date().toISOString(),
                });

            if (insertError) throw insertError;

            setSuccess(true);
            setTimeout(() => {
                onSuccess();
            }, 2000);
        } catch (err: any) {
            console.error('Error al enviar verificación:', err);
            setError(err.message || 'Error al enviar la verificación. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Verificar Inventario</h2>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-green-800 rounded-lg p-2 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Product Info */}
                <div className="p-6 bg-gray-50 border-b">
                    <h3 className="font-bold text-lg text-gray-900">{producto.nombre}</h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p><span className="font-semibold">Clave:</span> {producto.clave}</p>
                        <p><span className="font-semibold">Marca:</span> {producto.marca || 'N/A'}</p>
                        <p><span className="font-semibold">Cantidad en Sistema:</span> {producto.cantidad} unidades</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Cantidad Física */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Cantidad Física Encontrada *
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={cantidadFisica}
                            onChange={(e) => setCantidadFisica(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Ej: 10"
                            disabled={loading || success}
                        />
                    </div>

                    {/* Observaciones */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Observaciones
                        </label>
                        <textarea
                            value={observaciones}
                            onChange={(e) => setObservaciones(sanitizeObservations(e.target.value))}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                            placeholder="Notas adicionales (opcional)"
                            disabled={loading || success}
                        />
                    </div>

                    {/* Código de Empleado */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Código de Empleado *
                        </label>
                        <input
                            type="text"
                            maxLength={5}
                            value={codigoEmpleado}
                            onChange={(e) => setCodigoEmpleado(e.target.value.replace(/\D/g, ''))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-lg tracking-wider"
                            placeholder="12345"
                            disabled={loading || success}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Ingresa tu código único de 5 dígitos
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="flex items-start space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-green-700">
                                ¡Verificación enviada exitosamente!
                            </p>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={loading || success}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            disabled={loading || success}
                        >
                            {loading ? (
                                <>
                                    <Loader className="w-4 h-4 animate-spin" />
                                    <span>Enviando...</span>
                                </>
                            ) : (
                                <span>Enviar Verificación</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
