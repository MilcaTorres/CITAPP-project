import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * PrivateRoute
 * Protege rutas que requieren autenticación.
 * Si no hay usuario autenticado, redirige al login.
 */
interface PrivateRouteProps {
  children: JSX.Element;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { user, usuario, loading } = useAuth();

  // Muestra una pantalla de carga mientras se verifica la sesión
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario logueado, redirige al login
  if (!user || !usuario) {
    return <Navigate to="/login" replace />;
  }

  // Si todo está bien, renderiza las rutas internas (layout principal)
  return children;
}
