import { useState, useEffect } from 'react';
import { Package, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export function DashboardView() {
  const { usuario } = useAuth();
  const [stats, setStats] = useState({
    totalProductos: 0,
    productosDisponibles: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const { data: productos } = await supabase
      .from('productos')
      .select('cantidad');

    if (productos) {
      const total = productos.length;
      const disponibles = productos.filter((p) => p.cantidad > 0).length;
      setStats({
        totalProductos: total,
        productosDisponibles: disponibles,
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">
          BIENVENIDO {usuario?.nombre.toUpperCase()}
        </h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-700">PRODUCTOS DISPONIBLES</h2>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-5xl font-bold text-gray-900">{stats.productosDisponibles}</p>
        </div>

        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-700">TOTAL PRODUCTOS</h2>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-5xl font-bold text-gray-900">{stats.totalProductos}</p>
        </div>
      </div>
    </div>
  );
}
