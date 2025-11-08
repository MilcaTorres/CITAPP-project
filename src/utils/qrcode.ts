export function generateQRCodeUrl(data: string): string {
  const baseUrl = 'https://api.qrserver.com/v1/create-qr-code/';
  const params = new URLSearchParams({
    size: '300x300',
    data: data,
    format: 'png',
  });
  return `${baseUrl}?${params.toString()}`;
}

export function generateProductQRData(producto: { id: string; clave: string; nombre: string }): string {
  return JSON.stringify({
    id: producto.id,
    clave: producto.clave,
    nombre: producto.nombre,
    type: 'CITAPP_PRODUCT',
  });
}
