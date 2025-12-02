import { Package, QrCode, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Producto } from '../../types';
import { ProductCard } from '../Products/ProductCard';
import { QRScanner } from '../Products/QRScanner';
import { EmployeeProductDetail } from './EmployeeProductDetail';

export function EmployeeView() {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
    const [showScanner, setShowScanner] = useState(false);

    useEffect(() => {
        loadProductos();
    }, []);

    const loadProductos = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('productos')
                .select(`
          *,
          categoria:categorias(nombre),
          ubicacion:ubicaciones(codigo, pasillo, nivel, seccion)
        `)
                .order('nombre');

            if (error) throw error;
            setProductos(data || []);
        } catch (err) {
            console.error('Error cargando productos:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredProductos = productos.filter((p) =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.clave.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.marca.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleScan = (result: string) => {
        try {
            const data = JSON.parse(result);
            if (data.type === 'CITAPP_PRODUCT' && data.id) {
                const producto = productos.find((p) => p.id === data.id);
                if (producto) {
                    setSelectedProduct(producto);
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
                setSelectedProduct(producto);
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

    if (selectedProduct) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <EmployeeProductDetail
                    producto={selectedProduct}
                    onBack={() => setSelectedProduct(null)}
                    onSuccess={() => {
                        setSelectedProduct(null);
                        loadProductos();
                    }}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-primary text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Package className="w-8 h-8" />
                            <div>
                                <h1 className="text-2xl font-bold">CITAPP - Empleados</h1>
                                <p className="text-sm text-gray-300">Verificación de Inventario</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowScanner(true)}
                            className="bg-white text-primary px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2 font-semibold shadow-sm"
                        >
                            <QrCode className="w-5 h-5" />
                            <span>Escanear QR</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Search Bar */}
                <div className="mb-8">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, clave o marca..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm text-lg"
                        />
                    </div>
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                            <p className="text-gray-500 mt-4">Cargando productos...</p>
                        </div>
                    </div>
                ) : filteredProductos.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">
                            {searchTerm ? 'No se encontraron productos' : 'No hay productos disponibles'}
                        </p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProductos.map((producto) => (
                            <ProductCard
                                key={producto.id}
                                producto={producto}
                                onClick={() => setSelectedProduct(producto)}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
