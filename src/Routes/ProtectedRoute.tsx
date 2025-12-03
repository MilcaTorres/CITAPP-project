import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function ProtectedRoute({ children }: { children: JSX.Element }) {
    const { user, usuario, loading } = useAuth();

    // ⏳ Cargando → no renderizar nada todavía
    if (loading || usuario === null) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                Verificando acceso...
            </div>
        );
    }

    // ❌ No hay sesión
    if (!user) return <Navigate to="/login" replace />;

    // ❌ No existe en BD
    if (usuario === false) return <Navigate to="/login" replace />;

    // ❌ No es admin
    if (usuario.rol !== "admin") return <Navigate to="/login" replace />;

    // ❌ Admin inactivo
    if (!usuario.activo) return <Navigate to="/login" replace />;

    // ✔ Admin válido
    return children;
}
