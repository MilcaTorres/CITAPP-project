import jsPDF from 'jspdf';
import { ArrowLeft, Download, Edit2, QrCode, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { ProductWithRelations } from '../../models/product.model';
import { Producto } from '../../types';
import { ProductForm } from './ProductForm';
import { ConfirmDeleteProductModal } from './ConfirmDeleteProductModal';
import { ProductService } from "../../services/product.service";

interface ProductDetailProps {
  producto: Producto | ProductWithRelations;
  onBack: () => void;
  onGenerateQR: () => void;
  onDelete: () => void;
  onUpdated: () => void;
  readOnly?: boolean;
}

export function ProductDetail({ 
  producto, 
  onBack, 
  onGenerateQR, 
  onDelete, 
  onUpdated,
  readOnly = false 
}: ProductDetailProps) {
  const { isAdmin } = useAuth();

  const [showForm, setShowForm] = useState(false);
  // Estado local para el producto que se actualiza después de editar
  const [currentProducto, setCurrentProducto] = useState<
    Producto | ProductWithRelations
  >(producto);

  // Función para recargar el producto actualizado
  const handleProductUpdate = async () => {
    try {
      const updatedProduct = await ProductService.getById(producto.id);
      setCurrentProducto(updatedProduct);
      // Notificar al componente padre que el producto se actualizó
      if (onProductUpdated) {
        onProductUpdated();
      }
    } catch (error) {
      console.error("Error recargando producto:", error);
    }
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleExportQRPDF = () => {
    if (!currentProducto.qr_url) return;

    const doc = new jsPDF();

    // Título
    doc.setFontSize(22);
    doc.text(currentProducto.nombre, 105, 30, { align: "center" });

    doc.setFontSize(14);
    doc.text(`Clave: ${currentProducto.clave}`, 105, 40, { align: "center" });

    // Imagen QR
    // Nota: jsPDF necesita la imagen en base64 o una URL accesible.
    // Como la URL es de una API pública (qrserver), debería funcionar si no hay CORS bloqueante.
    // Si falla, tendríamos que convertirla a base64 primero.
    try {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = currentProducto.qr_url;
      img.onload = () => {
        doc.addImage(img, "PNG", 55, 50, 100, 100);
        doc.save(`QR_${currentProducto.clave}.pdf`);
      };
    } catch (error) {
      console.error("Error exportando QR:", error);
      alert("Error al exportar el PDF del QR");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Volver</span>
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="flex flex-col items-center">
          {currentProducto.qr_url ? (
            <>
              <img
                src={currentProducto.qr_url}
                alt={`QR de ${currentProducto.nombre}`}
                className="w-full max-w-sm mx-auto rounded-lg shadow-md mb-4"
              />
              <button
                onClick={handleExportQRPDF}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
              >
                <Download className="w-4 h-4" />
                <span>Exportar QR a PDF</span>
              </button>
            </>
          ) : (
            <div className="w-full max-w-sm mx-auto bg-gray-100 rounded-lg p-12 text-center">
              <QrCode className="w-24 h-24 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No hay código QR generado</p>
              {isAdmin && !readOnly && (
                <button
                  onClick={onGenerateQR}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 mx-auto"
                >
                  <QrCode className="w-5 h-5" />
                  <span>Generar QR</span>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {currentProducto.nombre}
            </h2>
            <p className="text-gray-500">Clave: {currentProducto.clave}</p>
          </div>

          <div className="space-y-3">
            {currentProducto.marca && (
              <div>
                <span className="text-sm text-gray-600">Marca:</span>
                <p className="text-lg font-medium text-gray-900">
                  {currentProducto.marca}
                </p>
              </div>
            )}

            {currentProducto.tipo && (
              <div>
                <span className="text-sm text-gray-600">Tipo:</span>
                <p className="text-lg font-medium text-gray-900">
                  {currentProducto.tipo}
                </p>
              </div>
            )}

            <div>
              <span className="text-sm text-gray-600">
                Cantidad disponible:
              </span>
              <p className="text-2xl font-bold text-gray-900">
                {currentProducto.cantidad}
              </p>
            </div>

            <div>
              <span className="text-sm text-gray-600">Clasificación:</span>
              <p className="text-lg font-medium text-gray-900 capitalize">
                {currentProducto.clasificacion}
              </p>
            </div>

            {currentProducto.ubicacion && (
              <div>
                <span className="text-sm text-gray-600">Ubicación:</span>
                <p className="text-lg font-medium text-gray-900">
                  {currentProducto.ubicacion.codigo} - Pasillo{" "}
                  {currentProducto.ubicacion.pasillo},{" "}
                  {currentProducto.ubicacion.nivel}
                </p>
              </div>
            )}

            {currentProducto.categoria && (
              <div>
                <span className="text-sm text-gray-600">Categoría:</span>
                <p className="text-lg font-medium text-gray-900">
                  {currentProducto.categoria.nombre}
                </p>
              </div>
            )}
          </div>

          {isAdmin && !readOnly && (
            <div className="flex space-x-4 pt-4">
              {/*  Abrir modal desde aquí */}
              <button
                onClick={() => setShowForm(true)}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Edit2 className="w-5 h-5" />
                <span>Editar producto</span>
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/*  Modal de editar */}
      {showForm && (
        <ProductForm
          producto={currentProducto}
          onClose={() => setShowForm(false)}
          onSave={async () => {
            setShowForm(false);
            onUpdated();
          }}
        />
      )}

      {/*  Modal de confirmar eliminación */}
      {showDeleteModal && (
        <ConfirmDeleteProductModal
        producto={producto}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={() => {
          setShowDeleteModal(false);
          onDelete();
        }}
        />
      )}
    </div>
  );
}
