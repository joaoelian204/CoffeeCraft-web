import { useState } from 'react';
import { CatalogoService } from '../../services/catalogoService';
import type { Producto } from '../../types';

interface TablaProductosProps {
  productos: Producto[];
  onEditarProducto: (producto: Producto) => void;
  onEliminarProducto: (id: string) => void;
  onActualizarLista: () => void;
}

export function TablaProductos({ 
  productos, 
  onEditarProducto, 
  onEliminarProducto,
  onActualizarLista 
}: TablaProductosProps) {
  const [productoEliminando, setProductoEliminando] = useState<string | null>(null);
  const [productoActualizandoStock, setProductoActualizandoStock] = useState<string | null>(null);
  const [nuevoStock, setNuevoStock] = useState<Record<string, number>>({});
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState<{
    show: boolean;
    producto?: Producto;
    tipo: 'eliminar' | 'restaurar' | 'permanente';
  }>({ show: false, tipo: 'eliminar' });

  const manejarEliminarProducto = async (producto: Producto) => {
    setMostrarConfirmacion({ show: true, producto, tipo: 'eliminar' });
  };

  const manejarRestaurarProducto = async (producto: Producto) => {
    setMostrarConfirmacion({ show: true, producto, tipo: 'restaurar' });
  };

  const manejarEliminarPermanente = async (producto: Producto) => {
    setMostrarConfirmacion({ show: true, producto, tipo: 'permanente' });
  };

  const confirmarAccion = async () => {
    if (!mostrarConfirmacion.producto) return;

    const { producto, tipo } = mostrarConfirmacion;
    
    try {
      if (tipo === 'eliminar') {
        setProductoEliminando(producto.id);
        await CatalogoService.eliminarProducto(producto.id);
      } else if (tipo === 'restaurar') {
        await CatalogoService.restaurarProducto(producto.id);
      } else if (tipo === 'permanente') {
        setProductoEliminando(producto.id);
        await CatalogoService.eliminarProductoPermanente(producto.id);
      }
      
      onEliminarProducto(producto.id);
      onActualizarLista();
    } catch (error: any) {
      console.error('Error en la acción:', error);
      alert(error.message || 'Error al realizar la acción');
    } finally {
      setProductoEliminando(null);
      setMostrarConfirmacion({ show: false, tipo: 'eliminar' });
    }
  };

  const manejarActualizarStock = async (productoId: string) => {
    const stock = nuevoStock[productoId];
    if (stock === undefined || stock < 0) return;

    try {
      setProductoActualizandoStock(productoId);
      await CatalogoService.actualizarStock(productoId, stock);
      onActualizarLista();
      setNuevoStock(prev => ({ ...prev, [productoId]: 0 }));
    } catch (error: any) {
      console.error('Error al actualizar stock:', error);
      alert(error.message || 'Error al actualizar el stock');
    } finally {
      setProductoActualizandoStock(null);
    }
  };

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(precio);
  };

  if (productos.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-stone-300 to-stone-400 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 opacity-50">
          📦
        </div>
        <h3 className="text-2xl font-bold text-stone-800 mb-4">No hay productos</h3>
        <p className="text-stone-600">Comienza agregando tu primer producto</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-emerald-500 to-amber-500 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Producto</th>
                <th className="px-6 py-4 text-left font-semibold">Categoría</th>
                <th className="px-6 py-4 text-left font-semibold">Precio</th>
                <th className="px-6 py-4 text-left font-semibold">Stock</th>
                <th className="px-6 py-4 text-left font-semibold">Estado</th>
                <th className="px-6 py-4 text-left font-semibold">Calificación</th>
                <th className="px-6 py-4 text-center font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {productos.map((producto) => (
                <tr 
                  key={producto.id} 
                  className={`hover:bg-stone-50 transition-colors ${
                    !producto.activo ? 'opacity-60 bg-red-50' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={producto.imagenUrl || 'https://via.placeholder.com/60x60/92400e/ffffff?text=☕'}
                        alt={producto.nombre}
                        className="w-12 h-12 rounded-xl object-cover"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src = 'https://via.placeholder.com/60x60/92400e/ffffff?text=☕';
                        }}
                      />
                      <div>
                        <div className="font-semibold text-stone-800">{producto.nombre}</div>
                        <div className="text-sm text-stone-600">
                          {producto.origen} - {producto.region}
                        </div>
                        <div className="text-xs text-stone-500">
                          Nivel: {producto.nivelTostado} | {producto.peso}g
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      {producto.categoria}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-stone-800">
                      {formatearPrecio(producto.precio)}
                    </div>
                    {producto.precioOriginal && producto.precioOriginal > producto.precio && (
                      <div className="text-sm">
                        <span className="line-through text-stone-500 mr-2">
                          {formatearPrecio(producto.precioOriginal)}
                        </span>
                        <span className="text-red-600 font-medium">
                          -{producto.descuento}%
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className={`font-semibold ${
                        producto.stock === 0 ? 'text-red-600' : 
                        producto.stock < 10 ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {producto.stock}
                      </span>
                      {producto.activo && (
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            min="0"
                            value={nuevoStock[producto.id] || ''}
                            onChange={(e) => setNuevoStock(prev => ({ 
                              ...prev, 
                              [producto.id]: parseInt(e.target.value) || 0 
                            }))}
                            className="w-16 px-2 py-1 text-xs border border-stone-300 rounded"
                            placeholder="0"
                          />
                          <button
                            onClick={() => manejarActualizarStock(producto.id)}
                            disabled={productoActualizandoStock === producto.id || !nuevoStock[producto.id]}
                            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                          >
                            {productoActualizandoStock === producto.id ? '...' : '✓'}
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      producto.activo 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {producto.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-medium">{producto.calificacion}</span>
                      <span className="text-stone-500 text-sm">
                        ({producto.cantidadReseñas})
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => onEditarProducto(producto)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Editar producto"
                      >
                        ✏️
                      </button>
                      
                      {producto.activo ? (
                        <button
                          onClick={() => manejarEliminarProducto(producto)}
                          disabled={productoEliminando === producto.id}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                          title="Eliminar producto"
                        >
                          {productoEliminando === producto.id ? '⏳' : '🗑️'}
                        </button>
                      ) : (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => manejarRestaurarProducto(producto)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                            title="Restaurar producto"
                          >
                            ↻
                          </button>
                          <button
                            onClick={() => manejarEliminarPermanente(producto)}
                            disabled={productoEliminando === producto.id}
                            className="p-2 text-red-800 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Eliminar permanentemente"
                          >
                            {productoEliminando === producto.id ? '⏳' : '💀'}
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de confirmación */}
      {mostrarConfirmacion.show && mostrarConfirmacion.producto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">
                  {mostrarConfirmacion.tipo === 'eliminar' ? '⚠️' : 
                   mostrarConfirmacion.tipo === 'restaurar' ? '↻' : '💀'}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-stone-800 mb-4">
                {mostrarConfirmacion.tipo === 'eliminar' && 'Eliminar Producto'}
                {mostrarConfirmacion.tipo === 'restaurar' && 'Restaurar Producto'}
                {mostrarConfirmacion.tipo === 'permanente' && 'Eliminar Permanentemente'}
              </h3>
              
              <p className="text-stone-600 mb-6">
                {mostrarConfirmacion.tipo === 'eliminar' && (
                  <>¿Estás seguro de que quieres eliminar <strong>{mostrarConfirmacion.producto.nombre}</strong>? 
                  El producto se marcará como inactivo pero podrás restaurarlo más tarde.</>
                )}
                {mostrarConfirmacion.tipo === 'restaurar' && (
                  <>¿Estás seguro de que quieres restaurar <strong>{mostrarConfirmacion.producto.nombre}</strong>? 
                  El producto volverá a estar activo en la tienda.</>
                )}
                {mostrarConfirmacion.tipo === 'permanente' && (
                  <>¿Estás seguro de que quieres eliminar permanentemente <strong>{mostrarConfirmacion.producto.nombre}</strong>? 
                  <span className="text-red-600 font-medium">Esta acción no se puede deshacer.</span></>
                )}
              </p>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setMostrarConfirmacion({ show: false, tipo: 'eliminar' })}
                  className="flex-1 px-6 py-3 border border-stone-300 text-stone-700 rounded-2xl font-medium hover:bg-stone-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarAccion}
                  className={`flex-1 px-6 py-3 rounded-2xl font-medium text-white transition-colors ${
                    mostrarConfirmacion.tipo === 'restaurar'
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {mostrarConfirmacion.tipo === 'eliminar' && 'Eliminar'}
                  {mostrarConfirmacion.tipo === 'restaurar' && 'Restaurar'}
                  {mostrarConfirmacion.tipo === 'permanente' && 'Eliminar Permanentemente'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 