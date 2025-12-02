import { BarChart3, LogOut, Package, User, Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export function Sidebar() {
  const { isAdmin, signOut, usuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: "/productos", label: "Productos", icon: Package, adminOnly: false },
    ...(isAdmin
      ? [
        { path: "/administradores", label: "Administradores", icon: Users, adminOnly: true },
        { path: "/reportes", label: "Reportes", icon: BarChart3, adminOnly: true },
      ]
      : []),
  ];

  return (
    <aside className="w-20 bg-primary flex flex-col items-center py-8 space-y-8">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`p-4 rounded-lg transition-colors ${isActive
                ? "bg-red-600 text-white"
                : "text-gray-400 hover:bg-gray-700 hover:text-white"
              }`}
            title={item.label}
          >
            <Icon className="w-6 h-6" />
          </button>
        );
      })}

      <div className="flex-1" />

      {isAdmin && (
        <button
          onClick={() => navigate("/perfil")}
          className={`p-4 rounded-lg transition-colors ${location.pathname === "/perfil"
              ? "bg-red-600 text-white"
              : "text-gray-400 hover:bg-gray-700 hover:text-white"
            }`}
          title="Mi Perfil"
        >
          <User className="w-6 h-6" />
        </button>
      )}

      {usuario && (
        <button
          onClick={signOut}
          className="p-4 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
          title="Cerrar Sesión"
        >
          <LogOut className="w-6 h-6" />
        </button>
      )}
    </aside>
  );
}
