import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LandingPage } from "../components/Landing/LandingPage";
import { useAuth } from "../contexts/AuthContext";

export function AuthCallback() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const { user, usuario, loading } = useAuth();

    console.log("AuthCallback rendered:", {
        hasUser: !!user,
        hasUsuario: !!usuario,
        loading,
        params: Object.fromEntries(params.entries())
    });

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
            // Si no hay usuario y no hay error, mostrar landing page
            // (esto maneja el caso de visitar "/" directamente)
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
            console.log("OAuth successful, redirecting to dashboard");
            navigate("/dashboard", { replace: true });
        }
    }, [params, user, usuario, loading, navigate]);

    // Si está cargando o no hay usuario, mostrar landing page
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-white text-xl">Verificando acceso...</div>
            </div>
        );
    }

    // Si no hay usuario autenticado, mostrar landing page
    if (!user) {
        return <LandingPage />;
    }

    // Si hay usuario pero aún se está procesando
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="text-white text-xl">Verificando acceso...</div>
        </div>
    );
}
