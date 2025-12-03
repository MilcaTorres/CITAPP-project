import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { X } from 'lucide-react';

export function ProfileView() {
  const { usuario } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [loading, setLoading] = useState(false);

  if (!usuario) return null;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwords.new !== passwords.confirm) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (passwords.new.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new,
      });

      if (error) throw error;

      alert('Contraseña actualizada exitosamente');
      setShowPasswordModal(false);
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      console.error('Error updating password:', error);
      alert(error.message || 'Error al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">MI PERFIL</h1>

      <div className="bg-white rounded-lg shadow p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Nombre(s)
          </label>
          <input
            type="text"
            value={usuario.nombre}
            readOnly
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Apellido(s)
          </label>
          <input
            type="text"
            value={usuario.apellidos}
            readOnly
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Correo Electrónico
          </label>
          <input
            type="email"
            value={usuario.email}
            readOnly
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900"
          />
        </div>

        <div className="pt-4">
          <p className="text-sm text-gray-700 mb-4">¿Desea cambiar la contraseña?</p>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Editar
          </button>
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Cambiar contraseña</h2>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  required
                  value={passwords.current}
                  onChange={(e) =>
                    setPasswords({ ...passwords, current: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords({ ...passwords, confirm: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Aceptar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
