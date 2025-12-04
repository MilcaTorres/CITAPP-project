import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { ProductWithRelations } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { Categoria, Producto, Ubicacion } from '../../types';
import { handleError } from '../../utils/error-handler';


interface ProductFormProps {
  producto?: Producto | ProductWithRelations;
  onClose: () => void;
  onSave: () => void;
}

function generarClaveAuto() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let codigo = "";
  for (let i = 0; i < 6; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PROD-${codigo}`;
}



export function ProductForm({ producto, onClose, onSave }: ProductFormProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clave: producto?.clave || '',
    nombre: producto?.nombre || '',
    marca: producto?.marca || '',
    tipo: producto?.tipo || '',
    cantidad: producto?.cantidad || 0,
    clasificacion: producto?.clasificacion || 'no frágil',
    categoria_id: producto?.categoria_id || '',
    ubicacion_id: producto?.ubicacion_id || '',
  });

  useEffect(() => {
    loadCategorias();
    loadUbicaciones();
  }, []);

  const loadCategorias = async () => {
    const { data } = await supabase
      .from('categorias')
      .select('*')
      .order('nombre');
    if (data) setCategorias(data);
  };

  const loadUbicaciones = async () => {
    const { data } = await supabase
      .from('ubicaciones')
      .select('*')
      .order('codigo');
    if (data) setUbicaciones(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let claveFinal = formData.clave;

      // Generar clave automática para productos nuevos
      if (!producto) {
        claveFinal = generarClaveAuto();
      }

      const dataToSave = {
        clave: claveFinal,
        nombre: formData.nombre,
        marca: formData.marca || '',
        tipo: formData.tipo || '',
        cantidad: formData.cantidad,
        clasificacion: formData.clasificacion as 'frágil' | 'no frágil',
        categoria_id: formData.categoria_id || undefined,
        ubicacion_id: formData.ubicacion_id || undefined,
      };

      // Usar ProductService en lugar de Supabase directo
      if (producto) {
        await ProductService.update(producto.id, dataToSave);
      } else {
        console.log("Creating product...");
        const savedProduct = await ProductService.create(dataToSave);
        console.log("Product created:", savedProduct);

        // Generar QR automáticamente para productos nuevos
        try {
          console.log("Generating QR for:", savedProduct.id);
          const qrUrl = await ProductService.generateQR(savedProduct.id);
          console.log("QR generated successfully:", qrUrl);
        } catch (qrError) {
          console.error("Error generating QR for new product:", qrError);
          // No fallamos la creación del producto si falla el QR, pero avisamos
          alert("El producto se creó pero hubo un error al generar el código QR. Intente generarlo manualmente.");
        }
      }

      // Pequeño delay para asegurar que la base de datos se actualizó antes de recargar
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log("Calling onSave...");
      onSave();
    } catch (error) {
      const appError = handleError(error);
      alert(appError.getUserMessage());
      console.error("Error saving product:", error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {producto ? 'Editar Producto' : 'Agregar Producto'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nombre del producto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marca
              </label>
              <input
                type="text"
                value={formData.marca}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Marca del producto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <input
                type="text"
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tipo de producto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.cantidad}
                onChange={(e) => setFormData({ ...formData, cantidad: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clasificación *
              </label>
              <select
                value={formData.clasificacion}
                onChange={(e) => setFormData({ ...formData, clasificacion: e.target.value as 'frágil' | 'no frágil' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="no frágil">No frágil</option>
                <option value="frágil">Frágil</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                value={formData.categoria_id}
                onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ubicación
              </label>
              <select
                value={formData.ubicacion_id}
                onChange={(e) => setFormData({ ...formData, ubicacion_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar ubicación</option>
                {ubicaciones.map((ub) => (
                  <option key={ub.id} value={ub.id}>
                    {ub.codigo} - {ub.pasillo}, {ub.nivel}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
