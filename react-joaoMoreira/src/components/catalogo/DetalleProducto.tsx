import { useEffect, useState } from 'react';
import { CarritoService } from '../../services/carritoService';
import type { ProductoCarrito } from '../../services/carritoService';

interface DetalleProductoProps {
  productoId: string;
  onVolver?: () => void;
  esRecomendacion?: boolean;
}

export function DetalleProducto({ productoId, onVolver, esRecomendacion = false }: DetalleProductoProps) {
  const [detalle, setDetalle] = useState<ProductoCarrito | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string>('');
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState(1);

  useEffect(() => {
    if (productoId) {
      cargarDetalleProducto();
    }
  }, [productoId]);

  const cargarDetalleProducto = async () => {
    try {
      setCargando(true);
      setError('');
      
      console.log('Cargando producto con ID:', productoId);
      const detalleData = await CarritoService.obtenerProductoPorId(productoId);
      console.log('Detalle obtenido:', detalleData);
      setDetalle(detalleData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el producto');
      console.error('Error al cargar producto:', err);
    } finally {
      setCargando(false);
    }
  };

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
    }).format(precio);
  };

  const calcularTotal = () => {
    if (!detalle) return 0;
    return detalle.precio * cantidadSeleccionada;
  };

  const agregarAlCarrito = () => {
    if (!detalle) return;
    
    console.log('Agregar al carrito:', {
      producto: detalle,
      cantidad: cantidadSeleccionada,
      total: calcularTotal()
    });
    
    // Enviar mensaje al shell para que lo reenvíe a Angular
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'AGREGAR_AL_CARRITO',
        data: {
          producto: detalle,
          cantidad: cantidadSeleccionada
        }
      }, 'http://localhost:9000');
      
      // Mostrar confirmación
      alert(`✅ ¡${detalle.nombre} agregado al carrito!\n\nPuedes ver tu carrito en el módulo de Angular.`);
    } else {
      // Fallback: mostrar alerta
      alert(`✅ ¡${detalle.nombre} agregado al carrito!\n\nNota: El carrito se maneja en el módulo de Angular.`);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-stone-50">
        <div className="text-center space-y-4 p-8 bg-white rounded-2xl shadow-lg">
          <div className="animate-spin text-4xl">🔄</div>
          <p className="text-lg font-medium text-stone-700">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-stone-50">
        <div className="text-center space-y-6 p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <div className="text-6xl">❌</div>
          <h3 className="text-xl font-bold text-red-600">Error al cargar el producto</h3>
          <p className="text-stone-600">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={cargarDetalleProducto}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
            >
              Reintentar
            </button>
            {onVolver && (
              <button 
                onClick={onVolver}
                className="px-6 py-3 bg-stone-500 hover:bg-stone-600 text-white rounded-lg font-medium transition-colors"
              >
                Volver al catálogo
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!detalle) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-stone-50 to-amber-50">
        <div className="text-center space-y-6 p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <div className="text-6xl">😞</div>
          <h3 className="text-xl font-bold text-stone-700">Producto no encontrado</h3>
          {onVolver && (
            <button 
              onClick={onVolver}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
            >
              Volver al catálogo
            </button>
          )}
        </div>
      </div>
    );
  }

  const producto = detalle;
  const mostrarDescuento = producto.precioOriginal && producto.precioOriginal > producto.precio;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {onVolver && (
          <button 
            onClick={onVolver}
            className="mb-8 flex items-center space-x-2 px-4 py-2 bg-white hover:bg-stone-50 text-stone-700 rounded-lg shadow-md transition-colors font-medium"
          >
            <span>←</span>
            <span>Volver al catálogo</span>
          </button>
        )}

        {/* Indicador de recomendación */}
        {esRecomendacion && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                🎯
              </div>
              <div>
                <h3 className="font-bold text-purple-800">¡Producto Recomendado!</h3>
                <p className="text-purple-700 text-sm">Este café fue seleccionado especialmente para ti basado en tus preferencias.</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Imagen del producto */}
          <div className="relative">
            <div className="aspect-square bg-white rounded-2xl shadow-lg overflow-hidden">
              <img 
                src={producto.imagenUrl || producto.imagen_url} 
                alt={producto.nombre}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=600&fit=crop';
                }}
              />
              {mostrarDescuento && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  -{producto.descuento}% OFF
                </div>
              )}
            </div>
          </div>

          {/* Información del producto */}
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            {/* Header del producto */}
            <div className="space-y-4">
              <h1 className="text-3xl lg:text-4xl font-bold text-stone-800">{producto.nombre}</h1>
              <div className="flex items-center space-x-2">
                <span className="text-amber-500">⭐</span>
                <span className="font-semibold text-lg">{producto.calificacion.toFixed(1)}</span>
                <span className="text-stone-500">({producto.cantidadReseñas} reseñas)</span>
              </div>
            </div>

            {/* Origen */}
            <div className="flex items-center space-x-2 text-stone-600">
              <span>📍</span>
              <span><strong className="text-stone-800">{producto.origen}</strong>, {producto.region}</span>
            </div>

            {/* Características */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <div className="text-sm text-stone-600">Categoría</div>
                <div className="font-semibold text-stone-800">{producto.categoria}</div>
              </div>
              <div className="text-center p-3 bg-stone-50 rounded-lg">
                <div className="text-sm text-stone-600">Tostado</div>
                <div className="font-semibold text-stone-800">{producto.nivelTostado}</div>
              </div>
              <div className="text-center p-3 bg-emerald-50 rounded-lg">
                <div className="text-sm text-stone-600">Peso</div>
                <div className="font-semibold text-stone-800">{producto.peso}g</div>
              </div>
            </div>

            {/* Notas de sabor */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-stone-800 flex items-center space-x-2">
                <span>🌟</span>
                <span>Notas de sabor</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {producto.notasSabor && producto.notasSabor.length > 0 ? (
                  producto.notasSabor.map((sabor: string, index: number) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 rounded-full text-sm font-medium"
                    >
                      {sabor}
                    </span>
                  ))
                ) : (
                  <span className="text-stone-500 italic">No hay notas de sabor disponibles</span>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-stone-800 flex items-center space-x-2">
                <span>📋</span>
                <span>Descripción</span>
              </h3>
              <p className="text-stone-600 leading-relaxed">{producto.descripcion}</p>
            </div>

            {/* Precio y compra */}
            <div className="border-t border-stone-200 pt-6 space-y-6">
              {/* Precio */}
              <div className="flex items-center space-x-3">
                {mostrarDescuento && (
                  <span className="text-lg text-stone-400 line-through">
                    {formatearPrecio(producto.precioOriginal!)}
                  </span>
                )}
                <span className="text-3xl font-bold text-amber-600">
                  {formatearPrecio(producto.precio)}
                </span>
              </div>

              {/* Cantidad */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-700">Cantidad:</label>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setCantidadSeleccionada(Math.max(1, cantidadSeleccionada - 1))}
                    disabled={cantidadSeleccionada <= 1}
                    className="w-10 h-10 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold"
                  >
                    -
                  </button>
                  <span className="w-16 text-center text-xl font-semibold">{cantidadSeleccionada}</span>
                  <button 
                    onClick={() => setCantidadSeleccionada(Math.min(producto.cantidadMaxima, cantidadSeleccionada + 1))}
                    disabled={cantidadSeleccionada >= producto.cantidadMaxima}
                    className="w-10 h-10 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Stock info */}
              <div className="text-sm">
                {producto.disponible ? (
                  <span className="text-green-600 font-medium">
                    ✅ {producto.stock} unidades disponibles
                  </span>
                ) : (
                  <span className="text-red-600 font-medium">
                    ❌ Producto agotado
                  </span>
                )}
              </div>

              {/* Total */}
              <div className="text-xl font-bold text-stone-800">
                Total: {formatearPrecio(calcularTotal())}
              </div>

              {/* Botón agregar al carrito */}
              <button 
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                  !producto.disponible 
                    ? 'bg-stone-300 text-stone-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
                onClick={agregarAlCarrito}
                disabled={!producto.disponible}
              >
                {!producto.disponible ? 'Agotado' : '🛒 Agregar al carrito'}
              </button>
            </div>
          </div>
        </div>

        {/* Productos relacionados */}
        {producto.productosRelacionados && producto.productosRelacionados.length > 0 && (
          <div className="mt-16">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-stone-800 mb-6 flex items-center space-x-2">
                <span>☕</span>
                <span>También te puede interesar</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {producto.productosRelacionados.slice(0, 4).map((productoRelacionado: ProductoCarrito) => (
                  <div key={productoRelacionado.id} className="bg-stone-50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-200">
                    <div className="aspect-square overflow-hidden">
                      <img 
                        src={productoRelacionado.imagenUrl || productoRelacionado.imagen_url} 
                        alt={productoRelacionado.nombre}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&h=300&fit=crop';
                        }}
                      />
                    </div>
                    <div className="p-4 space-y-2">
                      <h4 className="font-semibold text-stone-800 truncate">{productoRelacionado.nombre}</h4>
                      <p className="text-lg font-bold text-amber-600">{formatearPrecio(productoRelacionado.precio)}</p>
                      <button 
                        onClick={() => window.location.href = `#producto-${productoRelacionado.id}`}
                        className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors text-sm"
                      >
                        Ver producto
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 