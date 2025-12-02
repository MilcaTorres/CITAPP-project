import jsPDF from 'jspdf';
import { ArrowLeft, Download, Edit2, QrCode, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Producto } from '../../types';
import { ProductForm } from './ProductForm';

interface ProductDetailProps {
  producto: Producto;
  onBack: () => void;
  onGenerateQR: () => void;
  onDelete: () => void;
  readOnly?: boolean;
}

export function ProductDetail({ producto, onBack, onGenerateQR, onDelete, readOnly = false }: ProductDetailProps) {
  const { isAdmin } = useAuth();

  // Nuevo: estado del modal INTERNAMENTE
  const [showForm, setShowForm] = useState(false);

  const handleExportQRPDF = () => {
    if (!producto.qr_url) return;

    const doc = new jsPDF();

    // Título
    doc.setFontSize(22);
    doc.text(producto.nombre, 105, 30, { align: 'center' });

    doc.setFontSize(14);
    doc.text(`Clave: ${producto.clave}`, 105, 40, { align: 'center' });

    // Imagen QR
    // Nota: jsPDF necesita la imagen en base64 o una URL accesible. 
    // Como la URL es de una API pública (qrserver), debería funcionar si no hay CORS bloqueante.
    // Si falla, tendríamos que convertirla a base64 primero.
    try {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = producto.qr_url;
      img.onload = () => {
        doc.addImage(img, 'PNG', 55, 50, 100, 100);
        doc.save(`QR_${producto.clave}.pdf`);
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
          {producto.qr_url ? (
            <>
              <img
                src={producto.qr_url}
                alt={`QR de ${producto.nombre}`}
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
              <p className="text-gray-500">No hay código QR generado</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{producto.nombre}</h2>
            <p className="text-gray-500">Clave: {producto.clave}</p>
          </div>

          <div className="space-y-3">
            {producto.marca && (
              <div>
                <span className="text-sm text-gray-600">Marca:</span>
                <p className="text-lg font-medium text-gray-900">{producto.marca}</p>
              </div>
            )}

            {producto.tipo && (
              <div>
                <span className="text-sm text-gray-600">Tipo:</span>
                <p className="text-lg font-medium text-gray-900">{producto.tipo}</p>
              </div>
            )}

            <div>
              <span className="text-sm text-gray-600">Cantidad disponible:</span>
              <p className="text-2xl font-bold text-gray-900">{producto.cantidad}</p>
            </div>

            <div>
              <span className="text-sm text-gray-600">Clasificación:</span>
              <p className="text-lg font-medium text-gray-900 capitalize">{producto.clasificacion}</p>
            </div>

            {producto.ubicacion && (
              <div>
                <span className="text-sm text-gray-600">Ubicación:</span>
                <p className="text-lg font-medium text-gray-900">
                  {producto.ubicacion.codigo} - Pasillo {producto.ubicacion.pasillo}, {producto.ubicacion.nivel}
                </p>
              </div>
            )}

            {producto.categoria && (
              <div>
                <span className="text-sm text-gray-600">Categoría:</span>
                <p className="text-lg font-medium text-gray-900">{producto.categoria.nombre}</p>
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
                onClick={onDelete}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/*  Modal dentro de la vista de detalle */}
      {showForm && (
        <ProductForm
          producto={producto}
          onClose={() => setShowForm(false)}
          onSave={() => {
            setShowForm(false);
            //  Opcional: recargar datos desde la vista padre si quieres
          }}
        />
      )}
    </div>
  );
}
