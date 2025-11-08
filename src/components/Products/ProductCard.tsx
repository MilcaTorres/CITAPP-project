import { Package } from 'lucide-react';
import { Producto } from '../../types';

interface ProductCardProps {
  producto: Producto;
  onClick: () => void;
}

export function ProductCard({ producto, onClick }: ProductCardProps) {
  const stockColor = producto.cantidad === 0
    ? 'bg-red-100 text-red-800'
    : producto.cantidad < 10
    ? 'bg-yellow-100 text-yellow-800'
    : 'bg-green-100 text-green-800';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center space-x-4 mb-4">
        <div className="p-3 bg-gray-100 rounded-lg">
          <Package className="w-8 h-8 text-gray-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900">{producto.nombre}</h3>
          <p className="text-sm text-gray-500">{producto.clave}</p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {producto.marca && (
          <div className="flex justify-between">
            <span className="text-gray-600">Marca:</span>
            <span className="font-medium text-gray-900">{producto.marca}</span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Stock:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${stockColor}`}>
            {producto.cantidad}
          </span>
        </div>
        {producto.clasificacion && (
          <div className="flex justify-between">
            <span className="text-gray-600">Clasificación:</span>
            <span className="font-medium text-gray-900 capitalize">{producto.clasificacion}</span>
          </div>
        )}
      </div>
    </div>
  );
}
