import { AlertCircle, ArrowLeft, CheckCircle, ClipboardCheck, Loader, QrCode } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Producto } from '../../types';
import { sendDiscrepancyEmail } from '../../services/email';

interface EmployeeProductDetailProps {
    producto: Producto;
    onBack: () => void;
    onSuccess: () => void;
}

export function EmployeeProductDetail({ producto, onBack, onSuccess }: EmployeeProductDetailProps) {
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

            // ... (inside component)

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

            // Enviar correo si hay discrepancia
            if (!coincide) {
                // No bloqueamos el flujo si falla el correo, solo lo intentamos
                sendDiscrepancyEmail({
                    product_name: producto.nombre,
                    product_code: producto.clave,
                    system_qty: producto.cantidad,
                    physical_qty: cantidadFisicaNum,
                    employee_code: codigoEmpleado,
                    observations: observaciones.trim()
                }).catch(console.error);
            }

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
        <div className="bg-white rounded-lg shadow-lg p-8">
            <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver al listado</span>
            </button>

            <div className="grid md:grid-cols-2 gap-12">
                {/* Columna Izquierda: Información del Producto */}
                <div className="space-y-8">
                    <div>
                        {producto.qr_url ? (
                            <img
                                src={producto.qr_url}
                                alt={`QR de ${producto.nombre}`}
                                className="w-48 h-48 mx-auto rounded-lg shadow-md mb-6"
                            />
                        ) : (
                            <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                                <QrCode className="w-16 h-16 text-gray-400" />
                            </div>
                        )}

                        <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">{producto.nombre}</h2>
                        <p className="text-gray-500 text-center text-lg">Clave: {producto.clave}</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                        <h3 className="font-semibold text-gray-900 border-b pb-2">Detalles del Producto</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-sm text-gray-600 block">Marca</span>
                                <span className="font-medium text-gray-900">{producto.marca || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600 block">Ubicación</span>
                                <span className="font-medium text-gray-900">
                                    {producto.ubicacion ? `${producto.ubicacion.pasillo} - ${producto.ubicacion.nivel}` : 'N/A'}
                                </span>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600 block">Categoría</span>
                                <span className="font-medium text-gray-900">{producto.categoria?.nombre || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600 block">Stock en Sistema</span>
                                <span className="text-xl font-bold text-blue-600">{producto.cantidad}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Formulario de Verificación */}
                <div className="bg-white border-2 border-gray-100 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 bg-green-100 rounded-full">
                            <ClipboardCheck className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Reporte de Verificación</h3>
                            <p className="text-sm text-gray-500">Ingresa los datos del inventario físico</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                                placeholder="0"
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
                                onChange={(e) => setObservaciones(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                placeholder="Notas adicionales sobre el estado del producto..."
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-lg tracking-wider text-center"
                                placeholder="12345"
                                disabled={loading || success}
                            />
                            <p className="text-xs text-gray-500 mt-1 text-center">
                                Tu código único de 5 dígitos
                            </p>
                        </div>

                        {/* Mensajes */}
                        {error && (
                            <div className="flex items-start space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg animate-fadeIn">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="flex items-start space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg animate-fadeIn">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-green-700 font-medium">
                                    ¡Reporte enviado exitosamente! Redirigiendo...
                                </p>
                            </div>
                        )}

                        {/* Botón Submit */}
                        <button
                            type="submit"
                            className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                            disabled={loading || success}
                        >
                            {loading ? (
                                <>
                                    <Loader className="w-6 h-6 animate-spin" />
                                    <span>Enviando...</span>
                                </>
                            ) : (
                                <span>Enviar Reporte</span>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
