import { AlertTriangle } from "lucide-react";
import { Producto } from "../../types";
import { ProductWithRelations } from "../../models/product.model";

interface ConfirmDeleteProductModalProps {
  producto: Producto | ProductWithRelations;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteProductModal({
    producto,
    onConfirm,
    onCancel,
}: ConfirmDeleteProductModalProps) {
    return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          {/* Ícono de advertencia */}
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>

          {/* Título */}
          <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
            Eliminar Producto
          </h3>

          {/* Mensaje */}
          <p className="text-gray-600 text-center mb-6">
            ¿Estás seguro que deseas eliminar el producto
            <br />
            <strong className="text-gray-800">{producto.nombre}</strong>?
            <br />
            <span className="text-sm text-gray-500 mt-2 block">
              Esta acción no se puede deshacer.
            </span>
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
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}