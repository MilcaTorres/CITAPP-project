import { AlertTriangle } from "lucide-react";
import { Usuario } from "../../types";

interface ConfirmStatusChangeModalProps {
  usuario: Usuario;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmStatusChangeModal({
  usuario,
  onConfirm,
  onCancel,
}: ConfirmStatusChangeModalProps) {
  const isActivating = !usuario.activo;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          {/* Ícono de advertencia */}
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          </div>

          {/* Título */}
          <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
            {isActivating
              ? "Activar Administrador"
              : "Desactivar Administrador"}
          </h3>

          {/* Mensaje */}
          <p className="text-gray-600 text-center mb-6">
            {isActivating ? (
              <>
                ¿Estás seguro que deseas <strong>activar</strong> al
                administrador{" "}
                <strong>
                  {usuario.nombre} {usuario.apellidos}
                </strong>
                ?
              </>
            ) : (
              <>
                ¿Estás seguro que deseas <strong>desactivar</strong> al
                administrador{" "}
                <strong>
                  {usuario.nombre} {usuario.apellidos}
                </strong>
                ?
                <br />
                <span className="text-sm text-gray-500 mt-2 block">
                  El administrador no podrá acceder al sistema hasta que sea
                  activado nuevamente.
                </span>
              </>
            )}
          </p>

          {/* Botones */}
          <div className="flex space-x-4">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-6 py-3 rounded-lg transition-colors text-white ${
                isActivating
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {isActivating ? "Activar" : "Desactivar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
