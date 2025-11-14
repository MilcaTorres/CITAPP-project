import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Producto, Categoria, Ubicacion } from '../../types';
import { supabase } from '../../lib/supabase';
import { generateProductQRData, generateQRCodeUrl } from "../../utils/qrcode";


interface ProductFormProps {
  producto?: Producto;
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

      // 1️⃣ Nuevo producto → generar clave automática
      if (!producto) {
        claveFinal = generarClaveAuto();
      }

      // 2️⃣ Armar datos iniciales para insertar/actualizar
      const dataToSave = {
        ...formData,
        clave: claveFinal,
        categoria_id: formData.categoria_id || null,
        ubicacion_id: formData.ubicacion_id || null,
      };

      let savedProduct;

      // 3️⃣ Guardar producto (sin QR todavía)
      if (producto) {
        const { data, error } = await supabase
          .from("productos")
          .update(dataToSave)
          .eq("id", producto.id)
          .select()
          .single();

        if (error) throw error;
        savedProduct = data;
      } else {
        const { data, error } = await supabase
          .from("productos")
          .insert([dataToSave])
          .select()
          .single();

        if (error) throw error;
        savedProduct = data;
      }

      // 4️⃣ Generar información del QR (JSON)
      const qrData = generateProductQRData({
        id: savedProduct.id,
        clave: savedProduct.clave,
        nombre: savedProduct.nombre,
      });

      // 5️⃣ Generar URL del QR
      const qrUrl = generateQRCodeUrl(qrData);

      // 6️⃣ Actualizar producto con qr_url
      const { error: qrError } = await supabase
        .from("productos")
        .update({ qr_url: qrUrl })
        .eq("id", savedProduct.id);

      if (qrError) throw qrError;

      onSave();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Error al guardar el producto");
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
