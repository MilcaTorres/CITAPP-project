import { ArrowLeft, Loader } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { sendRecoveryCode } from '../../services/email';


type Step = 'EMAIL' | 'OTP' | 'NEW_PASSWORD';

export function ForgotPasswordView() {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>('EMAIL');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6 digits for Supabase OTP
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');


    // ...

    // Step 1: Send OTP
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            // 1. Generar código aleatorio de 6 dígitos
            const code = Math.floor(100000 + Math.random() * 900000).toString();

            // 2. Guardar código en base de datos (RPC)
            const { data: rpcSuccess, error: rpcError } = await supabase.rpc('request_password_recovery', {
                user_email: email,
                code: code
            });

            if (rpcError) throw rpcError;
            if (!rpcSuccess) throw new Error('El correo no está registrado en el sistema');

            // 3. Enviar correo con EmailJS
            const emailSuccess = await sendRecoveryCode(email, code);
            if (!emailSuccess) throw new Error('Error al enviar el correo. Intenta de nuevo.');

            setMessage('Código enviado a tu correo');
            setStep('OTP');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error al procesar la solicitud');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const token = otp.join('');
        if (token.length !== 6) {
            setError('El código debe tener 6 dígitos');
            setLoading(false);
            return;
        }

        // En este flujo personalizado, validamos el código realmente al final (al cambiar la contraseña)
        // O podríamos hacer un RPC de "validar", pero para simplificar pasamos al siguiente paso.
        setStep('NEW_PASSWORD');
        setLoading(false);
    };

    // Step 3: Update Password
    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            setLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            setLoading(false);
            return;
        }

        try {
            const token = otp.join('');

            // Llamar a la función segura de base de datos
            const { data: success, error } = await supabase.rpc('reset_password_with_code', {
                user_email: email,
                code: token,
                new_password: newPassword
            });

            if (error) throw error;
            if (!success) throw new Error('Código inválido o expirado');

            setMessage('Contraseña actualizada exitosamente');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error al actualizar la contraseña');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return; // Only 1 digit
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
            <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/login')}
                        className="flex items-center text-gray-400 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        <span>Volver al Login</span>
                    </button>

                    <div className="text-right mb-4">
                        <h1 className="text-2xl font-bold text-white">CITAPP</h1>
                        <p className="text-xs text-gray-400">Control de Inventario con Tecnología de Aplicación</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-8 shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                        Reestablecer contraseña
                    </h2>

                    {step === 'EMAIL' && (
                        <>
                            <p className="text-gray-500 text-center mb-6 text-sm">
                                Ingresa tu correo electrónico
                            </p>
                            <form onSubmit={handleSendOtp} className="space-y-6">
                                <div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-center"
                                        placeholder="ejemplo@correo.com"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex justify-center"
                                >
                                    {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Enviar código'}
                                </button>
                            </form>
                        </>
                    )}

                    {step === 'OTP' && (
                        <>
                            <p className="text-gray-500 text-center mb-6 text-sm">
                                Ingresa el código que recibiste en <span className="font-bold">{email}</span>
                            </p>
                            <form onSubmit={handleVerifyOtp} className="space-y-6">
                                <div className="flex justify-center gap-2">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`otp-${index}`}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            className="w-10 h-12 border border-gray-300 rounded-lg text-center text-xl font-bold focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        />
                                    ))}
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex justify-center"
                                >
                                    {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Verificar'}
                                </button>
                            </form>
                        </>
                    )}

                    {step === 'NEW_PASSWORD' && (
                        <>
                            <p className="text-gray-500 text-center mb-6 text-sm">
                                Ingresa tu nueva contraseña
                            </p>
                            <form onSubmit={handleUpdatePassword} className="space-y-4">
                                <div>
                                    <input
                                        type="password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="Nueva contraseña"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="Confirmar contraseña"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex justify-center"
                                >
                                    {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Guardar'}
                                </button>
                            </form>
                        </>
                    )}

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="mt-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg text-center">
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
