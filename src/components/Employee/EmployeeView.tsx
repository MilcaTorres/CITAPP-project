import { QrCode, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Producto } from '../../types';
import { ProductCard } from '../Products/ProductCard';
import { ProductDetail } from '../Products/ProductDetail';
import { QRScanner } from '../Products/QRScanner';

export function EmployeeView() {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [filteredProductos, setFilteredProductos] = useState<Producto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
    const [showScanner, setShowScanner] = useState(false);

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
                onGenerateQR={() => { }} // No-op for employees
                onDelete={() => { }} // No-op for employees
                readOnly={true}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Catálogo de Productos</h1>
                <div className="flex space-x-4">
                    <button
                        onClick={() => setShowScanner(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                        <QrCode className="w-5 h-5" />
                        <span>Escanear código QR</span>
                    </button>
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
        </div>
    );
}
