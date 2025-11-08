import { useState, useEffect } from 'react';
import { Search, Plus, QrCode } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Producto } from '../../types';
import { ProductCard } from './ProductCard';
import { ProductDetail } from './ProductDetail';
import { ProductForm } from './ProductForm';
import { QRScanner } from './QRScanner';
import { useAuth } from '../../contexts/AuthContext';
import { generateProductQRData, generateQRCodeUrl } from '../../utils/qrcode';

export function ProductsView() {
  const { isAdmin } = useAuth();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);

  useEffect(() => {
    loadProductos();
  }, []);

  useEffect(() => {
    const filtered = productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.clave.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.marca?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProductos(filtered);
  }, [searchTerm, productos]);

  const loadProductos = async () => {
    const { data, error } = await supabase
      .from('productos')
      .select(`
        *,
        categoria:categorias(*),
        ubicacion:ubicaciones(*)
      `)
      .order('nombre');

    if (error) {
      console.error('Error loading productos:', error);
      return;
    }

    setProductos(data || []);
  };

  const handleGenerateQR = async () => {
    if (!selectedProducto) return;

    const qrData = generateProductQRData(selectedProducto);
    const qrUrl = generateQRCodeUrl(qrData);

    const { error } = await supabase
      .from('productos')
      .update({ qr_url: qrUrl })
      .eq('id', selectedProducto.id);

    if (error) {
      console.error('Error generating QR:', error);
      alert('Error al generar código QR');
      return;
    }

    await loadProductos();
    setSelectedProducto({ ...selectedProducto, qr_url: qrUrl });
  };

  const handleDelete = async () => {
    if (!selectedProducto) return;

    if (!confirm(`¿Está seguro de eliminar el producto "${selectedProducto.nombre}"?`)) {
      return;
    }

    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', selectedProducto.id);

    if (error) {
      console.error('Error deleting producto:', error);
      alert('Error al eliminar el producto');
      return;
    }

    setSelectedProducto(null);
    loadProductos();
  };

  const handleScan = (result: string) => {
    try {
      const data = JSON.parse(result);
      if (data.type === 'CITAPP_PRODUCT' && data.id) {
        const producto = productos.find((p) => p.id === data.id);
        if (producto) {
          setSelectedProducto(producto);
          setShowScanner(false);
        } else {
          alert('Producto no encontrado');
        }
      }
    } catch (error) {
      const producto = productos.find(
        (p) => p.clave === result || p.id === result
      );
      if (producto) {
        setSelectedProducto(producto);
        setShowScanner(false);
      } else {
        alert('Producto no encontrado');
      }
    }
  };

  if (showScanner) {
    return (
      <QRScanner
        onScan={handleScan}
        onClose={() => setShowScanner(false)}
      />
    );
  }

  if (selectedProducto) {
    return (
      <ProductDetail
        producto={selectedProducto}
        onBack={() => setSelectedProducto(null)}
        onGenerateQR={handleGenerateQR}
        onEdit={() => {
          setEditingProducto(selectedProducto);
          setShowForm(true);
        }}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">PRODUCTOS</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowScanner(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <QrCode className="w-5 h-5" />
            <span>Escanear código QR</span>
          </button>
          {isAdmin && (
            <button
              onClick={() => {
                setEditingProducto(null);
                setShowForm(true);
              }}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Agregar producto</span>
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre, clave o marca..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProductos.map((producto) => (
          <ProductCard
            key={producto.id}
            producto={producto}
            onClick={() => setSelectedProducto(producto)}
          />
        ))}
      </div>

      {filteredProductos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No se encontraron productos</p>
        </div>
      )}

      {showForm && (
        <ProductForm
          producto={editingProducto || undefined}
          onClose={() => {
            setShowForm(false);
            setEditingProducto(null);
          }}
          onSave={() => {
            setShowForm(false);
            setEditingProducto(null);
            loadProductos();
          }}
        />
      )}
    </div>
  );
}
