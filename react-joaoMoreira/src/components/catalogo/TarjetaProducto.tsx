import type { Producto } from '../../types';

interface TarjetaProductoProps {
  producto: Producto;
  onClick?: () => void;
}

export function TarjetaProducto({ producto, onClick }: TarjetaProductoProps) {
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const formatearPrecio = (precio: number | undefined) => {
    if (!precio || precio === undefined) return '$0.00';
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
    }).format(precio);
  };

  const mostrarDescuento = producto.precioOriginal && producto.precioOriginal > producto.precio;

  return (
    <div 
      className={`bg-white rounded-xl shadow-lg overflow-hidden border border-amber-200 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
        onClick ? 'cursor-pointer' : 'cursor-default'
      }`}
      onClick={handleClick}
    >
      <div className="relative">
        <img 
          src={producto.imagenUrl || 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop'} 
          alt={producto.nombre || 'Producto de café'}
          className="w-full h-48 object-cover"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            // Si la imagen original falló, intentar con una imagen de café genérica
            if (img.src !== 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop') {
              img.src = 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop';
            } else {
              // Si incluso la imagen de fallback falla, usar una imagen placeholder local
              img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNhZsOpPC90ZXh0Pjwvc3ZnPg==';
            }
          }}
        />
        
        {/* Badges */}
        {mostrarDescuento && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
            -{producto.descuento}%
          </div>
        )}
        
        {producto.stock !== undefined && producto.stock <= 5 && producto.stock > 0 && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            ¡Últimas {producto.stock}!
          </div>
        )}
        
        {producto.stock !== undefined && producto.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">
              Agotado
            </span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold text-amber-800 line-clamp-2 flex-1">
            {producto.nombre || 'Nombre no disponible'}
          </h3>
          <div className="flex items-center text-sm text-amber-600 ml-2">
            <span>⭐</span>
            <span className="font-medium">{producto.calificacion ? producto.calificacion.toFixed(1) : '0.0'}</span>
            <span className="text-amber-500">({producto.cantidadReseñas || 0})</span>
          </div>
        </div>

        {/* Origen */}
        <div className="text-sm text-amber-600 flex items-center">
          <span className="mr-1">📍</span>
          <span>{producto.origen || 'Origen desconocido'}, {producto.region || 'Región desconocida'}</span>
        </div>

        {/* Características */}
        <div className="flex flex-wrap gap-1">
          <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
            {producto.nivelTostado || 'N/A'}
          </span>
          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
            {producto.categoria || 'N/A'}
          </span>
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
            {producto.peso || 0}g
          </span>
        </div>

        {/* Sabores */}
        <div className="flex flex-wrap gap-1">
          {producto.notasSabor && typeof producto.notasSabor === 'string' && (
            <>
              {producto.notasSabor.split(',').slice(0, 3).map((sabor, index) => (
                <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                  {sabor.trim()}
                </span>
              ))}
              {producto.notasSabor.split(',').length > 3 && (
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                  +{producto.notasSabor.split(',').length - 3}
                </span>
              )}
            </>
          )}
          {producto.notasSabor && Array.isArray(producto.notasSabor) && (
            <>
              {producto.notasSabor.slice(0, 3).map((sabor, index) => (
                <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                  {sabor}
                </span>
              ))}
              {producto.notasSabor.length > 3 && (
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                  +{producto.notasSabor.length - 3}
                </span>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-amber-100">
          <div className="flex items-center space-x-2">
            {mostrarDescuento && (
              <span className="text-sm text-gray-500 line-through">
                {formatearPrecio(producto.precioOriginal!)}
              </span>
            )}
            <span className="text-lg font-bold text-amber-800">
              {formatearPrecio(producto.precio)}
            </span>
          </div>

          <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              (producto.stock === 0 || producto.stock === undefined)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-600 text-white transform hover:scale-105'
            }`}
            disabled={producto.stock === 0 || producto.stock === undefined}
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            {(producto.stock === 0 || producto.stock === undefined) ? 'No disponible' : 'Ver detalles'}
          </button>
        </div>
      </div>
    </div>
  );
}
