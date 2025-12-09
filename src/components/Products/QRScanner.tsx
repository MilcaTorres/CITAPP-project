import { useEffect, useRef, useState } from 'react';
import { X, Search } from 'lucide-react';
import jsQR from 'jsqr';

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const scanningRef = useRef(true);

  useEffect(() => {
    let stream: MediaStream;

    navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    })
    .then((mediaStream) => {
      stream = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.play();
      }
      requestAnimationFrame(tick);
    })
    .catch((err) => {
      console.error(err);
      setError("No se pudo acceder a la cámara. Revisa permisos.");
    });

    return () => {
      scanningRef.current = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const tick = () => {
  if (!videoRef.current || !canvasRef.current || !scanningRef.current) {
    requestAnimationFrame(tick);
    return;
  }

  const video = videoRef.current;
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    requestAnimationFrame(tick);
    return;
  }

  if (video.videoWidth === 0 || video.videoHeight === 0) {
    requestAnimationFrame(tick);
    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const code = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: "dontInvert",
  });

  if (code && code.data) {
    scanningRef.current = false;
    onScan(code.data);   //QR leído correctamente
    onClose();           //Cerrar modal
    return;
  }

  requestAnimationFrame(tick);
};


  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-8">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Escanear código QR</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">

          {/* CÁMARA + LECTOR QR */}
          <div className="bg-black rounded-lg overflow-hidden flex justify-center relative">
            {error ? (
              <p className="text-red-600 p-6 text-center">{error}</p>
            ) : (
              <>
                <video
                  ref={videoRef}
                  className="w-full max-w-md rounded-lg"
                  autoPlay
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />
              </>
            )}
          </div>

          {/* RESPALDO MANUAL */}
          <div className="bg-gray-100 rounded-lg p-6 text-center">
            <p className="text-gray-600 mb-4">
              Si la cámara no detecta el código, ingréselo manualmente:
            </p>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Ingrese código o clave del producto"
                  className="w-full pl-10 pr-4 py-3 border rounded-lg"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg"
                >
                  Buscar
                </button>
              </div>
            </form>

          </div>

        </div>
      </div>
    </div>
  );
}
