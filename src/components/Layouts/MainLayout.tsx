import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAuth } from "../../contexts/AuthContext";

/**
 * MainLayout
 * Estructura base de la aplicación después del login.
 * Contiene el Sidebar, Header y el área de contenido dinámico (Outlet).
 */
export default function MainLayout() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [currentView, setCurrentView] = useState("dashboard");

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    navigate(`/${view}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar con navegación interna */}
      <Sidebar currentView={currentView} onViewChange={handleViewChange} />

      <div className="flex-1 flex flex-col">
        {/* Header superior */}
        <Header onProfileClick={() => handleViewChange("perfil")} />

        {/* Contenido dinámico de la ruta */}
        <main className="p-8 flex-1 overflow-y-auto">
          <Outlet />
        </main>

        {/* Footer opcional */}
        <footer className="text-center text-gray-400 text-sm py-4">
          CITAPP © {new Date().getFullYear()} — Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
}
