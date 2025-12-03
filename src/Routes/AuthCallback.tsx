import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function AuthCallback() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const { user, usuario, loading } = useAuth();

    useEffect(() => {
        const error = params.get("error");
        const errorDescription = params.get("error_description");

        // 1. Manejo de errores en URL (Supabase)
        if (error) {
            let message = "No pudimos validar tu cuenta. Intenta nuevamente.";

            if (errorDescription?.includes("before_user_created")) {
                message = "Tu cuenta no está registrada. Contacta a un administrador.";
            } else if (
                errorDescription?.includes("not allowed") ||
                errorDescription?.includes("denied")
            ) {
                message = "No tienes permisos para acceder al sistema.";
            }

            navigate("/login", { replace: true, state: { authError: message } });
            return;
        }

        // 2. Lógica normal de autenticación (si no hay error en URL)
        if (loading) return;

        if (!user) {
            navigate("/login", { replace: true });
            return;
        }

        if (usuario === false) {
            navigate("/login", {
                replace: true,
                state: { authError: "Tu cuenta no está registrada." },
            });
            return;
        }

        if (usuario) {
            if (usuario.rol !== "admin") {
                navigate("/login", {
                    replace: true,
                    state: { authError: "No tienes permisos de administrador." },
                });
                return;
            }

            if (!usuario.activo) {
                navigate("/login", {
                    replace: true,
                    state: { authError: "Tu cuenta está pendiente de activación." },
                });
                return;
            }

            // Todo correcto
            navigate("/dashboard", { replace: true });
        }
    }, [params, user, usuario, loading, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center text-white">
            Verificando acceso...
        </div>
    );
}
