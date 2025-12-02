import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

/**
 * MainLayout
 * Estructura base de la aplicación después del login.
 * Contiene el Sidebar, Header y el área de contenido dinámico (Outlet).
 */
export default function MainLayout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar con navegación interna */}
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* Header superior */}
        <Header onProfileClick={() => navigate("/perfil")} />

        {/* Contenido dinámico de la ruta */}
        <main className="p-8 flex-1 bg-secondary overflow-y-auto">
          <Outlet />
        </main>

        {/* Footer opcional */}
        <footer className="text-center bg-secondary text-white text-sm py-4">
          CITAPP © {new Date().getFullYear()} — Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
}
