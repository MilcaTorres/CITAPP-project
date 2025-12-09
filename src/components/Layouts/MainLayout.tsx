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
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar fijo con navegación interna */}
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* Header fijo superior */}
        <Header
          onProfileClick={() => navigate("/perfil")}
          className="sticky top-0 z-10"
        />

        {/* Contenido dinámico de la ruta */}
        <main className="flex-1 overflow-auto bg-secondary p-8">
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
