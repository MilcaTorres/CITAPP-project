import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function AuthCallback() {
    const { user, usuario, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (loading || usuario === null) return;

        if (!user) {
            navigate("/login", { replace: true });
            return;
        }

        if (usuario === false) {
            navigate("/login", { replace: true });
            return;
        }

        if (usuario.rol !== "admin" || !usuario.activo) {
            navigate("/login", { replace: true });
            return;
        }

        navigate("/dashboard", { replace: true });
    }, [user, usuario, loading]);

    return (
        <div className="min-h-screen flex items-center justify-center text-white">
            Verificando acceso...
        </div>
    );
}
