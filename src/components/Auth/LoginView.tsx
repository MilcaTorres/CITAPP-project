import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation } from "react-router-dom";

export function LoginView() {
  const location = useLocation();
  const redirectedError = location.state?.authError;
  const {
    signIn,
    signInWithGoogle,
    user,
    usuario,
    loading: authLoading,
    signOut,
  } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Efecto para manejar redirecciones y estados de usuario
  useEffect(() => {
    if (user) {
      if (usuario) {
        if (usuario.activo) {
          navigate("/dashboard", { replace: true });
        }
        // Si no está activo, nos quedamos en esta vista para mostrar el mensaje
      }
      // Si hay user pero no usuario, esperamos a que cargue (authLoading)
    }
  }, [user, usuario, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      // La navegación la maneja el useEffect
    } catch (err: any) {
      const message =
        err?.message ||
        (typeof err === "string" ? err : "Error inesperado al iniciar sesión.");
      setError(message);
      console.error("Error al iniciar sesión:", message);
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      // OAuth will redirect automatically
    } catch (err: any) {
      const message =
        err?.message ||
        (typeof err === "string" ? err : "Error al iniciar sesión con Google.");
      setError(message);
      console.error("Error al iniciar sesión con Google:", message);
      setLoading(false);
    }
  };

  // Si el usuario está autenticado pero inactivo
  if (user && usuario && !usuario.activo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
              <svg
                className="h-8 w-8 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Cuenta Pendiente
            </h2>
            <p className="text-gray-300">
              Tu cuenta ha sido creada pero requiere aprobación de un
              administrador para acceder.
            </p>
            <p className="text-gray-400 text-sm mt-4">
              Por favor, contacta al administrador del sistema para activar tu
              cuenta.
            </p>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  // Si hay usuario autenticado pero no se ha cargado el perfil (y ya no está cargando auth)
  // Esto puede pasar si falló el trigger o la carga
  if (user && !usuario && !authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8 text-center">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-2">
              Configurando cuenta...
            </h2>
            <p className="text-gray-300">
              Estamos preparando tu perfil. Si esto persiste, por favor contacta
              soporte.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors mb-3"
          >
            Reintentar
          </button>
          <button
            onClick={() => signOut()}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url(https://images.pexels.com/photos/4483610/pexels-photo-4483610.jpeg?auto=compress&cs=tinysrgb&w=1920)",
      }}
    >
      {/* Capa oscura de fondo */}
      <div className="absolute inset-0 bg-black bg-opacity-60" />

      {/* Contenedor del formulario */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-gray-900 bg-opacity-90 backdrop-blur-sm rounded-lg shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">BIENVENIDO</h1>
            <p className="text-gray-300 text-sm">Acceso para Administradores</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Correo
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Ingresa tu correo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Contraseña"
              />
            </div>

            {redirectedError && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm mb-4">
                {redirectedError}
              </div>
            )}

            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || authLoading}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading || authLoading
                ? "Iniciando sesión..."
                : "Iniciar Sesión"}
            </button>

            <button
              type="button"
              onClick={() => navigate('/empleado')}
              className="w-full bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
            >
              <span>Acceder como Empleado</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">O</span>
            </div>
          </div>

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || authLoading}
            className="w-full bg-white text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              width="20"
              height="20"
            >
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.9 16.46 0 20.12 0 24c0 3.88.9 7.54 2.55 10.78l7.98-6.19z"
              />
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.55 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
            </svg>
            Continuar con Google
          </button>

          <div className="mt-6 text-center space-y-4">
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-gray-400 text-sm hover:text-white transition-colors"
            >
              ¿Olvidó su contraseña?
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
