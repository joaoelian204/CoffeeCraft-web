import { useState, useEffect } from 'react';
import { DetalleProducto } from '../components/catalogo/DetalleProducto';
import { FiltrosProductos } from '../components/catalogo/FiltrosProductos';
import { ListaProductos } from '../components/catalogo/ListaProductos';
import type { FiltrosCatalogo } from '../types';

export function CatalogoPage() {
  const [filtros, setFiltros] = useState<FiltrosCatalogo>({});
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<string | null>(null);
  const [esRecomendacion, setEsRecomendacion] = useState(false);

  const mostrarDetalle = (productoId: string) => {
    setProductoSeleccionado(productoId);
  };

  const volverAlCatalogo = () => {
    setProductoSeleccionado(null);
    setEsRecomendacion(false);
  };

  const aplicarFiltros = (nuevosFiltros: FiltrosCatalogo) => {
    setFiltros(nuevosFiltros);
  };

  const limpiarFiltros = () => {
    setFiltros({});
  };

  // Escuchar mensajes del shell para mostrar productos específicos
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'PRODUCT_SELECTED') {
        console.log('🛍️ Catálogo recibió producto seleccionado:', event.data.productoId);
        setProductoSeleccionado(event.data.productoId);
        setEsRecomendacion(true); // Marcar como recomendación
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Si hay un producto seleccionado, mostrar los detalles
  if (productoSeleccionado) {
    return (
      <div className="min-h-screen">
        <DetalleProducto 
          productoId={productoSeleccionado}
          onVolver={volverAlCatalogo}
          esRecomendacion={esRecomendacion}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decorativo */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900/5 via-emerald-900/5 to-amber-900/5 rounded-3xl"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-amber-200/20 to-emerald-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-emerald-200/20 to-stone-200/20 rounded-full blur-2xl"></div>
        
        <div className="relative text-center py-16 px-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-100 to-amber-100 text-stone-800 px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              <span className="text-emerald-600">🌱</span>
              <span>Cafés Especiales del Ecuador</span>
            </div>
            
            {/* Título principal */}
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-stone-800 via-emerald-800 to-amber-800">
                Catálogo
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-emerald-600 to-stone-600">
                Premium
              </span>
            </h1>
            
            {/* Descripción */}
            <p className="text-xl text-stone-600 leading-relaxed max-w-3xl mx-auto">
              Descubre nuestra selección curada de cafés ecuatorianos de especialidad, 
              cada uno con características únicas que reflejan la riqueza de nuestras tierras.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 max-w-2xl mx-auto">
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-amber-600">120+</div>
                <div className="text-stone-600 font-medium text-sm">Variedades</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-amber-600">15</div>
                <div className="text-stone-600 font-medium text-sm">Regiones</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-amber-600">100%</div>
                <div className="text-stone-600 font-medium text-sm">Orgánico</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header de sección con controles */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
            ☕
          </div>
          <div>
            <h2 className="text-2xl font-bold text-stone-800">Nuestros Cafés</h2>
            <p className="text-stone-600 text-sm">Calidad premium garantizada</p>
          </div>
        </div>
        
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg ${
            mostrarFiltros
              ? 'bg-gradient-to-r from-emerald-600 to-amber-600 text-white shadow-emerald-500/25'
              : 'bg-white/80 text-stone-700 hover:bg-white border border-stone-200/50'
          }`}
        >
          <span className="text-lg">🔍</span>
          <span>{mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}</span>
        </button>
      </div>

      {/* Componente de Filtros separado */}
      {mostrarFiltros && (
        <div className="animate-fadeIn">
          <FiltrosProductos 
            filtros={filtros}
            onFiltrosChange={aplicarFiltros}
            onLimpiarFiltros={limpiarFiltros}
          />
        </div>
      )}

      {/* Lista de productos */}
      <div className="bg-white/40 backdrop-blur-sm border border-stone-200/30 rounded-3xl p-8 shadow-lg">
        <ListaProductos 
          filtros={filtros}
          onProductoClick={mostrarDetalle} 
        />
      </div>
    </div>
  );
} 