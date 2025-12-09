import { User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onProfileClick: () => void;
  className?: string;
}

export function Header({ onProfileClick, className = "" }: HeaderProps) {
  const { usuario } = useAuth();

  return (
    <header className={`bg-primary text-white px-8 py-4 flex justify-between items-center ${className}`}>
      <div>
        <h1 className="text-2xl font-bold">CITAPP</h1>
        <p className="text-sm text-gray-400">Control de Inventario con Tecnología de Aplicación</p>
      </div>

      {usuario && (
        <button
          onClick={onProfileClick}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <User className="w-5 h-5" />
          <span className="text-sm">Mi perfil</span>
        </button>
      )}
    </header>
  );
}
