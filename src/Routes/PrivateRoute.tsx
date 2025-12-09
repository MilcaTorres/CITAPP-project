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

  console.log("🔐 [PrivateRoute] Estado:", { loading, hasUser: !!user, usuario: usuario === null ? 'null' : usuario === false ? 'false' : 'Usuario' });

  // Muestra una pantalla de carga mientras se verifica la sesión
  if (loading) {
    console.log("⏳ [PrivateRoute] Mostrando pantalla de carga (loading=true)");
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
  if (!user || usuario === false) {
    console.log("❌ [PrivateRoute] Redirigiendo a login:", { hasUser: !!user, usuario });
    return <Navigate to="/login" replace />;
  }

  // Si el usuario no está activo, redirige al login (donde se mostrará el mensaje de pendiente)
  if (usuario && !usuario.activo) {
    console.log("❌ [PrivateRoute] Usuario inactivo, redirigiendo a login");
    return <Navigate to="/login" replace />;
  }

  console.log("✅ [PrivateRoute] Acceso permitido");
  // Si todo está bien, renderiza las rutas internas (layout principal)
  return children;
}
