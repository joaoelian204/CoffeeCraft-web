import { useEffect, useState } from 'react';
import { FormularioProducto } from '../components/admin/FormularioProducto';
import { TablaProductos } from '../components/admin/TablaProductos';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { CatalogoService } from '../services/catalogoService';
import type { Producto } from '../types';

interface EstadisticasAdmin {
  totalProductos: number;
  productosActivos: number;
  productosInactivos: number;
  promedioCalificacion: number;
  totalStock: number;
  valorInventario: number;
}

export function AdminPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasAdmin | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string>('');
  const [vistaActual, setVistaActual] = useState<'lista' | 'crear' | 'editar'>('lista');
  const [productoEditando, setProductoEditando] = useState<Producto | undefined>();
  const [filtroActivo, setFiltroActivo] = useState<'todos' | 'activos' | 'inactivos'>('todos');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError('');
      
      const [productosData, estadisticasData] = await Promise.all([
        CatalogoService.obtenerTodosLosProductos(),
        CatalogoService.obtenerEstadisticas()
      ]);
      
      setProductos(productosData);
      setEstadisticas(estadisticasData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos');
      console.error('Error:', err);
    } finally {
      setCargando(false);
    }
  };

  const manejarGuardarProducto = (producto: Producto) => {
    if (productoEditando) {
      // Actualizar producto existente
      setProductos(prev => 
        prev.map(p => p.id === producto.id ? producto : p)
      );
    } else {
      // Agregar nuevo producto
      setProductos(prev => [producto, ...prev]);
    }
    
    setVistaActual('lista');
    setProductoEditando(undefined);
    cargarDatos(); // Recargar para actualizar estadísticas
  };

  const manejarEditarProducto = (producto: Producto) => {
    setProductoEditando(producto);
    setVistaActual('editar');
  };

  const manejarEliminarProducto = (id: string) => {
    setProductos(prev => prev.filter(p => p.id !== id));
  };

  const manejarCancelar = () => {
    setVistaActual('lista');
    setProductoEditando(undefined);
  };

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(valor);
  };

  const productosFiltrados = productos.filter(producto => {
    if (filtroActivo === 'activos') return producto.activo;
    if (filtroActivo === 'inactivos') return !producto.activo;
    return true;
  });

  if (cargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm border border-red-200/50 rounded-3xl p-12 text-center shadow-2xl max-w-2xl">
          <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-8">
            ❌
          </div>
          <h3 className="text-3xl font-bold text-stone-800 mb-4">Error al cargar administración</h3>
          <p className="text-stone-600 mb-8 leading-relaxed text-lg">{error}</p>
          <button 
            onClick={cargarDatos}
            className="bg-gradient-to-r from-emerald-500 to-amber-500 hover:from-emerald-600 hover:to-amber-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header de administración */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                ⚙️
              </div>
              <div>
                <h1 className="text-3xl font-bold text-stone-800">Administración de Productos</h1>
                <p className="text-stone-600">Gestiona el catálogo de productos de CoffeCraft</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setVistaActual('lista')}
                className={`px-6 py-3 rounded-2xl font-medium transition-all ${
                  vistaActual === 'lista' 
                    ? 'bg-emerald-500 text-white shadow-lg' 
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                📊 Lista de Productos
              </button>
              <button
                onClick={() => setVistaActual('crear')}
                className={`px-6 py-3 rounded-2xl font-medium transition-all ${
                  vistaActual === 'crear' 
                    ? 'bg-emerald-500 text-white shadow-lg' 
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                ➕ Crear Producto
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        {estadisticas && vistaActual === 'lista' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-stone-600 text-sm font-medium">Total Productos</p>
                  <p className="text-2xl font-bold text-stone-800">{estadisticas.totalProductos}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  📦
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-stone-600 text-sm font-medium">Productos Activos</p>
                  <p className="text-2xl font-bold text-emerald-600">{estadisticas.productosActivos}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  ✅
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-stone-600 text-sm font-medium">Productos Inactivos</p>
                  <p className="text-2xl font-bold text-red-600">{estadisticas.productosInactivos}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  ❌
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-stone-600 text-sm font-medium">Calificación Promedio</p>
                  <p className="text-2xl font-bold text-amber-600">{estadisticas.promedioCalificacion}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  ⭐
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-stone-600 text-sm font-medium">Total Stock</p>
                  <p className="text-2xl font-bold text-purple-600">{estadisticas.totalStock}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  📈
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-stone-600 text-sm font-medium">Valor Inventario</p>
                  <p className="text-2xl font-bold text-green-600">{formatearMoneda(estadisticas.valorInventario)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  💰
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contenido principal */}
        {vistaActual === 'lista' && (
          <div className="space-y-6">
            {/* Filtros */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <div className="flex flex-wrap items-center gap-4">
                <span className="font-medium text-stone-700">Filtrar por estado:</span>
                <div className="flex gap-2">
                  {[
                    { id: 'todos', label: 'Todos', emoji: '📋' },
                    { id: 'activos', label: 'Activos', emoji: '✅' },
                    { id: 'inactivos', label: 'Inactivos', emoji: '❌' }
                  ].map((filtro) => (
                    <button
                      key={filtro.id}
                      onClick={() => setFiltroActivo(filtro.id as typeof filtroActivo)}
                      className={`px-4 py-2 rounded-xl font-medium transition-all ${
                        filtroActivo === filtro.id
                          ? 'bg-emerald-500 text-white shadow-lg'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {filtro.emoji} {filtro.label}
                    </button>
                  ))}
                </div>
                <div className="ml-auto text-sm text-stone-600">
                  Mostrando {productosFiltrados.length} de {productos.length} productos
                </div>
              </div>
            </div>

            {/* Tabla de productos */}
            <TablaProductos
              productos={productosFiltrados}
              onEditarProducto={manejarEditarProducto}
              onEliminarProducto={manejarEliminarProducto}
              onActualizarLista={cargarDatos}
            />
          </div>
        )}

        {(vistaActual === 'crear' || vistaActual === 'editar') && (
          <FormularioProducto
            producto={productoEditando}
            onGuardar={manejarGuardarProducto}
            onCancelar={manejarCancelar}
          />
        )}
      </div>
    </div>
  );
} 