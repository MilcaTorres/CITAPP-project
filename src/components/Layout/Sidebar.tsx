import { Package, Users, LogOut, BarChart3, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const { isAdmin, signOut, usuario } = useAuth();

  const menuItems = [
    { id: 'products', label: 'Productos', icon: Package, adminOnly: false },
    ...(isAdmin ? [
      { id: 'administrators', label: 'Administradores', icon: Users, adminOnly: true },
      { id: 'reports', label: 'Reportes', icon: BarChart3, adminOnly: true },
    ] : []),
  ];

  return (
    <aside className="w-20 bg-gray-800 flex flex-col items-center py-8 space-y-8">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`p-4 rounded-lg transition-colors ${
              currentView === item.id
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
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
          onClick={() => onViewChange('profile')}
          className={`p-4 rounded-lg transition-colors ${
            currentView === 'profile'
              ? 'bg-red-600 text-white'
              : 'text-gray-400 hover:bg-gray-700 hover:text-white'
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
