import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export function LoginView() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@citapp.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      // ✅ Redirige al dashboard después del login exitoso
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      const message =
        err?.message ||
        (typeof err === "string"
          ? err
          : "Error inesperado al iniciar sesión.");
      setError(message);
      console.error("Error al iniciar sesión:", message);
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-3xl font-bold text-white mb-2">
              BIENVENIDO
            </h1>
            <p className="text-gray-300 text-sm">
              Acceso para Administradores
            </p>
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
                placeholder="correo@ejemplo.com"
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

            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">¿Olvidó su contraseña?</p>
          </div>
        </div>
      </div>
    </div>
  );
}
