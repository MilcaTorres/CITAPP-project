import { Plus, QrCode, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import type { ProductWithRelations } from "../../models/product.model";
import { ProductService } from "../../services/product.service";
import { handleError } from "../../utils/error-handler";
import { ProductCard } from "./ProductCard";
import { ProductDetail } from "./ProductDetail";
import { ProductForm } from "./ProductForm";
import { QRScanner } from "./QRScanner";
import AlertMessage from "../AlertMessage"

export function ProductsView() {
  const { isAdmin } = useAuth();
  const [productos, setProductos] = useState<ProductWithRelations[]>([]);
  const [filteredProductos, setFilteredProductos] = useState<
    ProductWithRelations[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducto, setSelectedProducto] =
    useState<ProductWithRelations | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [editingProducto, setEditingProducto] =
    useState<ProductWithRelations | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alertData, setAlertData] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const refreshSelectedProduct = async () => {
    if (!selectedProducto) return;

    const updated = await ProductService.getById(selectedProducto.id);
    setSelectedProducto(updated);
  }

  useEffect(() => {
    if (alertData) {
      const timer = setTimeout(() => setAlertData(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alertData]);

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
    try {
      setLoading(true);
      setError(null);
      const data = await ProductService.getAll();
      setProductos(data);
    } catch (err) {
      const appError = handleError(err);
      setError(appError.getUserMessage());
      setAlertData({
        type: "error",
        message: appError.getUserMessage()
      });
      console.error("Error loading productos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async () => {
    if (!selectedProducto) return;

    try {
      setLoading(true);
      console.log("Generating QR for product:", selectedProducto.id);
      const qrUrl = await ProductService.generateQR(selectedProducto.id);
      console.log("QR URL generated:", qrUrl);

      // Recargar el producto específico desde la base de datos
      const updatedProduct = await ProductService.getById(selectedProducto.id);
      console.log("Updated product loaded:", updatedProduct);

      // Actualizar la lista completa
      await loadProductos();

      // Actualizar el producto seleccionado con los datos frescos
      setSelectedProducto(updatedProduct);

      setAlertData({
        type: "success",
        message: "Código QR generado correctamente"
      });
    } catch (err) {
      const appError = handleError(err);
      setAlertData({
        type: "error",
        message: appError.getUserMessage()
      });
      console.error("Error generating QR:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProducto) return;

    try {
      setLoading(true);
      await ProductService.delete(selectedProducto.id);
      setAlertData({
        type: "success",
        message: "El producto se eliminó correctamente"
      });
      setSelectedProducto(null);
      await loadProductos();
    } catch (err) {
      const appError = handleError(err);
      setAlertData({
        type: "error",
        message: appError.getUserMessage()
      })
      console.error("Error deleting producto:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = (result: string) => {
    try {
      const data = JSON.parse(result);
      if (data.type === "CITAPP_PRODUCT" && data.id) {
        const producto = productos.find((p) => p.id === data.id);
        if (producto) {
          setSelectedProducto(producto);
          setShowScanner(false);
        } else {
          setAlertData({
            type: "error",
            message: "Producto no encontrado"
          });
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
        setAlertData({
          type: "error",
          message: "Producto no encontrado"
        });
      }
    }
  };

  if (showScanner) {
    return (
      <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
    );
  }

  if (selectedProducto) {
    return (
      <>
      {alertData && (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999]">
    <AlertMessage type={alertData.type} message={alertData.message} />
    </div>
    )}
      <ProductDetail
        producto={selectedProducto}
        onBack={() => setSelectedProducto(null)}
        onGenerateQR={handleGenerateQR}
        onDelete={handleDelete}
        onUpdated={async () => {
          await refreshSelectedProduct();
          await loadProductos();

          setAlertData({
            type: "success",
            message: "Producto actualizado correctamente"
          });
        }}
      />
      </>
    );
  }

  return (
    <>
    {alertData && (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999]">
        <AlertMessage type={alertData.type} message={alertData.message} />
      </div>
    )}
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-3xl font-bold text-white mb-4 sm:mb-0">
          PRODUCTOS
        </h1>
        <div className="flex space-x-2 sm:space-x-4 w-full sm:w-auto">
          <button
            onClick={() => setShowScanner(true)}
            className="bg-blue-600 text-white px-3 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1 sm:space-x-2 flex-grow sm:flex-grow-0"
          >
            <QrCode className="w-5 h-5" />
            <span className="hidden sm:inline">Escanear código QR</span>
          </button>
          {isAdmin && (
            <button
              onClick={() => {
                setEditingProducto(null);
                setShowForm(true);
              }}
              className="bg-red-600 text-white px-3 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-1 sm:space-x-2 flex-grow sm:flex-grow-0"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Agregar producto</span>
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
          onSave={async (status) => {
            setShowForm(false);
            setEditingProducto(null);
            await loadProductos();
            await refreshSelectedProduct();
            setAlertData({
              type: "success",
              message: 
              status === "created"
              ? "Producto agregado correctamente"
              : "Producto actualizado correctamente"
            });
          }}
        />
      )}
    </div>
    </>
  );
}
