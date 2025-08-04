import { useEffect, useState } from 'react';
import { CatalogoService } from '../../services/catalogoService';
import type { FiltrosCatalogo, Producto } from '../../types';
import { TarjetaProducto } from './TarjetaProducto';

interface ListaProductosProps {
  filtros?: FiltrosCatalogo;
  onProductoClick?: (productoId: string) => void;
}

export function ListaProductos({ filtros = {}, onProductoClick }: ListaProductosProps) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    cargarProductos();
  }, [filtros]);

  const cargarProductos = async () => {
    try {
      setCargando(true);
      setError('');
      const productosObtenidos = await CatalogoService.obtenerProductos(filtros);
      setProductos(productosObtenidos);
    } catch (err: any) {
      setError(err.message || 'Error al cargar productos');
      console.error('Error:', err);
    } finally {
      setCargando(false);
    }
  };

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm border border-red-200/50 rounded-3xl p-12 text-center shadow-2xl">
          <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-8">
            ❌
          </div>
          <h3 className="text-3xl font-bold text-stone-800 mb-4">Error al cargar productos</h3>
          <p className="text-stone-600 mb-8 leading-relaxed text-lg">{error}</p>
          <button 
            onClick={cargarProductos}
            className="bg-gradient-to-r from-emerald-500 to-amber-500 hover:from-emerald-600 hover:to-amber-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            Reintentar Carga
          </button>
        </div>
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="space-y-8">
        {/* Loading Header */}
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6 animate-pulse">
            ☕
          </div>
          <div className="space-y-4">
            <div className="h-8 bg-stone-200 rounded-2xl max-w-md mx-auto animate-pulse"></div>
            <div className="h-4 bg-stone-100 rounded-xl max-w-lg mx-auto animate-pulse"></div>
          </div>
        </div>

        {/* Loading Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg overflow-hidden animate-pulse">
              <div className="h-48 bg-stone-200"></div>
              <div className="p-6 space-y-4">
                <div className="h-6 bg-stone-200 rounded-xl"></div>
                <div className="h-4 bg-stone-100 rounded-lg"></div>
                <div className="h-4 bg-stone-100 rounded-lg w-3/4"></div>
                <div className="h-10 bg-stone-200 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header con estadísticas */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
            📊
          </div>
          <div>
            <h2 className="text-2xl font-bold text-stone-800">
              {productos.length} {productos.length === 1 ? 'Producto' : 'Productos'} Encontrados
            </h2>
            <p className="text-stone-600 text-sm">
              {Object.keys(filtros).length > 0 
                ? 'Resultados filtrados según tus preferencias' 
                : 'Toda nuestra colección premium'}
            </p>
          </div>
        </div>

        {/* Opciones de vista y ordenamiento */}
        <div className="flex items-center space-x-4">
          <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-2xl p-2 shadow-lg">
            <select className="bg-transparent text-stone-700 font-medium text-sm focus:outline-none cursor-pointer">
              <option>Más relevantes</option>
              <option>Precio: menor a mayor</option>
              <option>Precio: mayor a menor</option>
              <option>Mejor calificados</option>
              <option>Más recientes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid de productos mejorado */}
      {productos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {productos.map((producto, index) => (
            <div
              key={producto.id}
              className="animate-fadeIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <TarjetaProducto 
                producto={producto}
                onClick={onProductoClick ? () => onProductoClick(producto.id) : undefined}
              />
            </div>
          ))}
        </div>
      ) : (
        /* Estado vacío elegante */
        <div className="text-center py-20">
          <div className="max-w-lg mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-stone-300 to-stone-400 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-8 opacity-50">
              🔍
            </div>
            <h3 className="text-3xl font-bold text-stone-800 mb-4">No se encontraron productos</h3>
            <p className="text-stone-600 text-lg leading-relaxed mb-8">
              {Object.keys(filtros).length > 0 
                ? 'Intenta ajustar los filtros de búsqueda para encontrar más opciones.'
                : 'Parece que no hay productos disponibles en este momento.'}
            </p>
            
            {Object.keys(filtros).length > 0 && (
              <div className="space-y-4">
                <p className="text-stone-500 text-sm">Sugerencias:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">Amplía el rango de precio</span>
                  <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm">Prueba otra categoría</span>
                  <span className="bg-stone-100 text-stone-700 px-3 py-1 rounded-full text-sm">Cambia la región</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Paginación (placeholder para futuro) */}
      {productos.length > 12 && (
        <div className="flex justify-center pt-8">
          <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 text-stone-500 hover:text-stone-700 transition-colors duration-200">
                ← Anterior
              </button>
              <div className="flex space-x-1">
                {[1, 2, 3].map((page) => (
                  <button
                    key={page}
                    className={`w-10 h-10 rounded-xl font-medium transition-all duration-200 ${
                      page === 1
                        ? 'bg-gradient-to-r from-emerald-500 to-amber-500 text-white shadow-lg'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button className="px-4 py-2 text-stone-500 hover:text-stone-700 transition-colors duration-200">
                Siguiente →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 