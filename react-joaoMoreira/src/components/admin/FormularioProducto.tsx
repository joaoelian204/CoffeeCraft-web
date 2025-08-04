import { useEffect, useState } from 'react';
import { CatalogoService, type ProductoInput } from '../../services/catalogoService';
import type { Producto } from '../../types';
import { LoadingSpinner } from '../shared/LoadingSpinner';

interface FormularioProductoProps {
  producto?: Producto;
  onGuardar: (producto: Producto) => void;
  onCancelar: () => void;
}

export function FormularioProducto({ producto, onGuardar, onCancelar }: FormularioProductoProps) {
  const [formData, setFormData] = useState<ProductoInput>({
    nombre: '',
    descripcion: '',
    precio: 0,
    precioOriginal: undefined,
    origen: '',
    region: '',
    nivelTostado: 'medio',
    notasSabor: [],
    imagenUrl: '',
    categoria: '',
    stock: 0,
    peso: 340,
    activo: true
  });

  const [notaSaborTemporal, setNotaSaborTemporal] = useState('');
  const [cargando, setCargando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  // Llenar formulario si estamos editando
  useEffect(() => {
    if (producto) {
      setFormData({
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio,
        precioOriginal: producto.precioOriginal,
        origen: producto.origen,
        region: producto.region,
        nivelTostado: producto.nivelTostado,
        notasSabor: [...producto.notasSabor],
        imagenUrl: producto.imagenUrl || '',
        categoria: producto.categoria,
        stock: producto.stock,
        peso: producto.peso,
        activo: producto.activo
      });
    }
  }, [producto]);

  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio';
    }

    if (!formData.descripcion.trim()) {
      nuevosErrores.descripcion = 'La descripción es obligatoria';
    }

    if (formData.precio <= 0) {
      nuevosErrores.precio = 'El precio debe ser mayor a 0';
    }

    if (formData.precioOriginal && formData.precioOriginal <= formData.precio) {
      nuevosErrores.precioOriginal = 'El precio original debe ser mayor al precio actual';
    }

    if (!formData.origen.trim()) {
      nuevosErrores.origen = 'El origen es obligatorio';
    }

    if (!formData.region.trim()) {
      nuevosErrores.region = 'La región es obligatoria';
    }

    if (!formData.categoria.trim()) {
      nuevosErrores.categoria = 'La categoría es obligatoria';
    }

    if (formData.stock < 0) {
      nuevosErrores.stock = 'El stock no puede ser negativo';
    }

    if (formData.peso <= 0) {
      nuevosErrores.peso = 'El peso debe ser mayor a 0';
    }

    if (formData.notasSabor.length === 0) {
      nuevosErrores.notasSabor = 'Debe agregar al menos una nota de sabor';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarCambio = (campo: keyof ProductoInput, valor: any) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
    
    // Limpiar error del campo modificado
    if (errores[campo]) {
      setErrores(prev => ({ ...prev, [campo]: '' }));
    }
  };

  const agregarNotaSabor = () => {
    if (notaSaborTemporal.trim() && !formData.notasSabor.includes(notaSaborTemporal.trim())) {
      setFormData(prev => ({
        ...prev,
        notasSabor: [...prev.notasSabor, notaSaborTemporal.trim()]
      }));
      setNotaSaborTemporal('');
    }
  };

  const eliminarNotaSabor = (nota: string) => {
    setFormData(prev => ({
      ...prev,
      notasSabor: prev.notasSabor.filter(n => n !== nota)
    }));
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    setCargando(true);
    try {
      let productoGuardado: Producto;
      
      if (producto) {
        // Actualizar producto existente
        productoGuardado = await CatalogoService.actualizarProducto(producto.id, formData);
      } else {
        // Crear nuevo producto
        productoGuardado = await CatalogoService.crearProducto(formData);
      }
      
      onGuardar(productoGuardado);
    } catch (error: any) {
      console.error('Error al guardar producto:', error);
      setErrores({ general: error.message || 'Error al guardar el producto' });
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-stone-800 mb-2">
          {producto ? 'Editar Producto' : 'Crear Nuevo Producto'}
        </h2>
        <p className="text-stone-600">
          {producto ? 'Modifica los datos del producto' : 'Completa todos los campos para crear un nuevo producto'}
        </p>
      </div>

      {errores.general && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl mb-6">
          <strong>Error:</strong> {errores.general}
        </div>
      )}

      <form onSubmit={manejarEnvio} className="space-y-6">
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Nombre del Producto *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => manejarCambio('nombre', e.target.value)}
              className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errores.nombre ? 'border-red-500' : 'border-stone-300'
              }`}
              placeholder="Ej: Café Tarqui Premium"
            />
            {errores.nombre && <p className="text-red-500 text-sm mt-1">{errores.nombre}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Categoría *
            </label>
            <select
              value={formData.categoria}
              onChange={(e) => manejarCambio('categoria', e.target.value)}
              className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errores.categoria ? 'border-red-500' : 'border-stone-300'
              }`}
              aria-label="Categoría del producto"
            >
              <option value="">Seleccionar categoría</option>
              <option value="arabica">Arábica</option>
              <option value="robusta">Robusta</option>
              <option value="especial">Especial</option>
              <option value="organico">Orgánico</option>
              <option value="comercial">Comercial</option>
              <option value="mezcla">Mezcla</option>
              <option value="origen-unico">Origen Único</option>
            </select>
            {errores.categoria && <p className="text-red-500 text-sm mt-1">{errores.categoria}</p>}
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Descripción *
          </label>
          <textarea
            value={formData.descripcion}
            onChange={(e) => manejarCambio('descripcion', e.target.value)}
            rows={4}
            className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
              errores.descripcion ? 'border-red-500' : 'border-stone-300'
            }`}
            placeholder="Describe las características del café..."
          />
          {errores.descripcion && <p className="text-red-500 text-sm mt-1">{errores.descripcion}</p>}
        </div>

        {/* Origen y región */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Origen *
            </label>
            <input
              type="text"
              value={formData.origen}
              onChange={(e) => manejarCambio('origen', e.target.value)}
              className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errores.origen ? 'border-red-500' : 'border-stone-300'
              }`}
              placeholder="Ej: Ecuador"
            />
            {errores.origen && <p className="text-red-500 text-sm mt-1">{errores.origen}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Región *
            </label>
            <input
              type="text"
              value={formData.region}
              onChange={(e) => manejarCambio('region', e.target.value)}
              className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errores.region ? 'border-red-500' : 'border-stone-300'
              }`}
              placeholder="Ej: Loja"
            />
            {errores.region && <p className="text-red-500 text-sm mt-1">{errores.region}</p>}
          </div>
        </div>

        {/* Nivel de tostado */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Nivel de Tostado *
          </label>
          <div className="grid grid-cols-3 gap-4">
            {(['ligero', 'medio', 'oscuro'] as const).map((nivel) => (
              <label key={nivel} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="nivelTostado"
                  value={nivel}
                  checked={formData.nivelTostado === nivel}
                  onChange={(e) => manejarCambio('nivelTostado', e.target.value)}
                  className="sr-only"
                />
                <div className={`w-full p-4 border-2 rounded-2xl text-center transition-all ${
                  formData.nivelTostado === nivel
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-stone-300 text-stone-600 hover:border-stone-400'
                }`}>
                  <div className="font-medium capitalize">{nivel}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Notas de sabor */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Notas de Sabor *
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={notaSaborTemporal}
              onChange={(e) => setNotaSaborTemporal(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarNotaSabor())}
              className="flex-1 px-4 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Ej: Chocolate, Frutas cítricas..."
            />
            <button
              type="button"
              onClick={agregarNotaSabor}
              className="px-6 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
            >
              Agregar
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.notasSabor.map((nota) => (
              <span
                key={nota}
                className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm"
              >
                {nota}
                <button
                  type="button"
                  onClick={() => eliminarNotaSabor(nota)}
                  className="text-amber-600 hover:text-amber-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          {errores.notasSabor && <p className="text-red-500 text-sm mt-1">{errores.notasSabor}</p>}
        </div>

        {/* Precios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Precio Actual ($) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.precio}
              onChange={(e) => manejarCambio('precio', parseFloat(e.target.value) || 0)}
              className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errores.precio ? 'border-red-500' : 'border-stone-300'
              }`}
              placeholder="0.00"
            />
            {errores.precio && <p className="text-red-500 text-sm mt-1">{errores.precio}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Precio Original ($) <span className="text-stone-500">(opcional)</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.precioOriginal || ''}
              onChange={(e) => manejarCambio('precioOriginal', e.target.value ? parseFloat(e.target.value) : undefined)}
              className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errores.precioOriginal ? 'border-red-500' : 'border-stone-300'
              }`}
              placeholder="0.00"
            />
            {errores.precioOriginal && <p className="text-red-500 text-sm mt-1">{errores.precioOriginal}</p>}
          </div>
        </div>

        {/* Stock y peso */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Stock (unidades) *
            </label>
            <input
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => manejarCambio('stock', parseInt(e.target.value) || 0)}
              className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errores.stock ? 'border-red-500' : 'border-stone-300'
              }`}
              placeholder="0"
            />
            {errores.stock && <p className="text-red-500 text-sm mt-1">{errores.stock}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Peso (gramos) *
            </label>
            <input
              type="number"
              min="1"
              value={formData.peso}
              onChange={(e) => manejarCambio('peso', parseInt(e.target.value) || 0)}
              className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errores.peso ? 'border-red-500' : 'border-stone-300'
              }`}
              placeholder="340"
            />
            {errores.peso && <p className="text-red-500 text-sm mt-1">{errores.peso}</p>}
          </div>
        </div>

        {/* URL de imagen */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            URL de Imagen <span className="text-stone-500">(opcional)</span>
          </label>
          <input
            type="url"
            value={formData.imagenUrl}
            onChange={(e) => manejarCambio('imagenUrl', e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="https://example.com/imagen.jpg"
          />
        </div>

        {/* Estado activo */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="activo"
            checked={formData.activo}
            onChange={(e) => manejarCambio('activo', e.target.checked)}
            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-stone-300 rounded"
          />
          <label htmlFor="activo" className="ml-2 block text-sm text-stone-700">
            Producto activo (visible en la tienda)
          </label>
        </div>

        {/* Botones */}
        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            disabled={cargando}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-amber-500 hover:from-emerald-600 hover:to-amber-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
          >
            {cargando ? 'Guardando...' : (producto ? 'Actualizar Producto' : 'Crear Producto')}
          </button>
          
          <button
            type="button"
            onClick={onCancelar}
            className="px-8 py-4 border border-stone-300 text-stone-700 rounded-2xl font-medium hover:bg-stone-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
} 