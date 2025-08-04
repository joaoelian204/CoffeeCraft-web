import React, { useEffect, useState } from 'react';
import type { DificultadExperiencia, Experiencia, ExperienciaInput, TipoExperiencia } from '../../types';

interface FormularioExperienciaProps {
  experiencia?: Experiencia;
  onSubmit: (experienciaInput: ExperienciaInput) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

interface FormErrors {
  titulo?: string;
  descripcion?: string;
  tipo?: string;
  dificultad?: string;
  duracion?: string;
  precio?: string;
  imagen_url?: string;
  ubicacion?: {
    ciudad?: string;
    direccion?: string;
    coordenadas?: string;
  };
  incluye?: string;
  requisitos?: string;
}

const TIPOS_EXPERIENCIA: { value: TipoExperiencia; label: string }[] = [
  { value: 'tour-finca', label: 'Tour de Finca' },
  { value: 'cata-cafe', label: 'Cata de Café' },
  { value: 'taller-barista', label: 'Taller de Barista' },
  { value: 'cosecha', label: 'Cosecha' },
  { value: 'proceso', label: 'Proceso' }
];

const DIFICULTADES: { value: DificultadExperiencia; label: string }[] = [
  { value: 'facil', label: 'Fácil' },
  { value: 'moderado', label: 'Moderado' },
  { value: 'dificil', label: 'Difícil' }
];

export const FormularioExperiencia: React.FC<FormularioExperienciaProps> = ({
  experiencia,
  onSubmit,
  onCancel,
  isLoading
}) => {
  const [formData, setFormData] = useState<ExperienciaInput>({
    titulo: '',
    descripcion: '',
    tipo: 'tour-finca',
    dificultad: 'facil',
    duracion: 180, // 3 horas por defecto
    precio: 0,
    imagen_url: '',
    ubicacion: {
      ciudad: '',
      direccion: '',
      coordenadas: {
        lat: 0,
        lng: 0
      }
    },
    incluye: [],
    requisitos: [],
    activo: true
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [incluyeInput, setIncluyeInput] = useState('');
  const [requisitosInput, setRequisitosInput] = useState('');

  useEffect(() => {
    if (experiencia) {
      setFormData({
        titulo: experiencia.titulo,
        descripcion: experiencia.descripcion,
        tipo: experiencia.tipo,
        dificultad: experiencia.dificultad,
        duracion: experiencia.duracion,
        precio: experiencia.precio,
        imagen_url: experiencia.imagen_url,
        ubicacion: experiencia.ubicacion,
        incluye: experiencia.incluye || [],
        requisitos: experiencia.requisitos || [],
        activo: experiencia.activo,
        calificacion: experiencia.calificacion,
        cantidad_resenas: experiencia.cantidad_resenas
      });
      setIncluyeInput(experiencia.incluye?.join(', ') || '');
      setRequisitosInput(experiencia.requisitos?.join(', ') || '');
    }
  }, [experiencia]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es requerido';
    } else if (formData.titulo.length < 5) {
      newErrors.titulo = 'El título debe tener al menos 5 caracteres';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    } else if (formData.descripcion.length < 20) {
      newErrors.descripcion = 'La descripción debe tener al menos 20 caracteres';
    }

    if (formData.duracion <= 0) {
      newErrors.duracion = 'La duración debe ser mayor a 0';
    } else if (formData.duracion > 600) {
      newErrors.duracion = 'La duración no puede ser mayor a 600 minutos (10 horas)';
    }

    if (formData.precio <= 0) {
      newErrors.precio = 'El precio debe ser mayor a 0';
    } else if (formData.precio > 1000) {
      newErrors.precio = 'El precio no puede ser mayor a $1000';
    }

    if (!formData.imagen_url.trim()) {
      newErrors.imagen_url = 'La URL de la imagen es requerida';
    } else if (!isValidUrl(formData.imagen_url)) {
      newErrors.imagen_url = 'La URL de la imagen no es válida';
    }

    if (!formData.ubicacion.ciudad.trim()) {
      newErrors.ubicacion = { ...newErrors.ubicacion, ciudad: 'La ciudad es requerida' };
    }

    if (!formData.ubicacion.direccion.trim()) {
      newErrors.ubicacion = { ...newErrors.ubicacion, direccion: 'La dirección es requerida' };
    }

    if (formData.ubicacion.coordenadas.lat === 0 || formData.ubicacion.coordenadas.lng === 0) {
      newErrors.ubicacion = { ...newErrors.ubicacion, coordenadas: 'Las coordenadas son requeridas' };
    }

    if (formData.incluye.length === 0) {
      newErrors.incluye = 'Al menos un elemento debe estar incluido';
    }

    if (formData.requisitos.length === 0) {
      newErrors.requisitos = 'Al menos un requisito debe ser especificado';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('Error al enviar formulario:', error);
      }
    }
  };

  const handleArrayInput = (value: string, setter: (arr: string[]) => void) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setter(items);
  };

  const handleIncluyeChange = (value: string) => {
    setIncluyeInput(value);
    handleArrayInput(value, (items) => {
      setFormData(prev => ({ ...prev, incluye: items }));
    });
  };

  const handleRequisitosChange = (value: string) => {
    setRequisitosInput(value);
    handleArrayInput(value, (items) => {
      setFormData(prev => ({ ...prev, requisitos: items }));
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {experiencia ? 'Editar Experiencia' : 'Nueva Experiencia'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Título */}
              <div className="md:col-span-2">
                <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    errors.titulo ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Tour de Café en Finca Orgánica"
                />
                {errors.titulo && <p className="mt-1 text-sm text-red-600">{errors.titulo}</p>}
              </div>

              {/* Descripción */}
              <div className="md:col-span-2">
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    errors.descripcion ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Describe la experiencia en detalle..."
                />
                {errors.descripcion && <p className="mt-1 text-sm text-red-600">{errors.descripcion}</p>}
              </div>

              {/* Tipo */}
              <div>
                <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo *
                </label>
                <select
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as TipoExperiencia }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {TIPOS_EXPERIENCIA.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dificultad */}
              <div>
                <label htmlFor="dificultad" className="block text-sm font-medium text-gray-700 mb-2">
                  Dificultad *
                </label>
                <select
                  id="dificultad"
                  value={formData.dificultad}
                  onChange={(e) => setFormData(prev => ({ ...prev, dificultad: e.target.value as DificultadExperiencia }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {DIFICULTADES.map(dificultad => (
                    <option key={dificultad.value} value={dificultad.value}>
                      {dificultad.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duración */}
              <div>
                <label htmlFor="duracion" className="block text-sm font-medium text-gray-700 mb-2">
                  Duración (minutos) *
                </label>
                <input
                  type="number"
                  id="duracion"
                  value={formData.duracion}
                  onChange={(e) => setFormData(prev => ({ ...prev, duracion: parseInt(e.target.value) || 0 }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    errors.duracion ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="180"
                  min="1"
                  max="600"
                />
                {errors.duracion && <p className="mt-1 text-sm text-red-600">{errors.duracion}</p>}
              </div>

              {/* Precio */}
              <div>
                <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-2">
                  Precio (USD) *
                </label>
                <input
                  type="number"
                  id="precio"
                  value={formData.precio}
                  onChange={(e) => setFormData(prev => ({ ...prev, precio: parseFloat(e.target.value) || 0 }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    errors.precio ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="25.00"
                  step="0.01"
                  min="0.01"
                  max="1000"
                />
                {errors.precio && <p className="mt-1 text-sm text-red-600">{errors.precio}</p>}
              </div>

              {/* Imagen URL */}
              <div className="md:col-span-2">
                <label htmlFor="imagen_url" className="block text-sm font-medium text-gray-700 mb-2">
                  URL de la Imagen *
                </label>
                <input
                  type="url"
                  id="imagen_url"
                  value={formData.imagen_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, imagen_url: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    errors.imagen_url ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                {errors.imagen_url && <p className="mt-1 text-sm text-red-600">{errors.imagen_url}</p>}
              </div>

              {/* Ubicación */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Ubicación</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="ciudad" className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      id="ciudad"
                      value={formData.ubicacion.ciudad}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        ubicacion: { ...prev.ubicacion, ciudad: e.target.value }
                      }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        errors.ubicacion?.ciudad ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Loja"
                    />
                    {errors.ubicacion?.ciudad && <p className="mt-1 text-sm text-red-600">{errors.ubicacion.ciudad}</p>}
                  </div>

                  <div>
                    <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      id="direccion"
                      value={formData.ubicacion.direccion}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        ubicacion: { ...prev.ubicacion, direccion: e.target.value }
                      }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        errors.ubicacion?.direccion ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Finca El Paraíso, km 15 vía Loja-Catamayo"
                    />
                    {errors.ubicacion?.direccion && <p className="mt-1 text-sm text-red-600">{errors.ubicacion.direccion}</p>}
                  </div>

                  <div>
                    <label htmlFor="latitud" className="block text-sm font-medium text-gray-700 mb-2">
                      Latitud *
                    </label>
                    <input
                      type="number"
                      id="latitud"
                      value={formData.ubicacion.coordenadas.lat}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        ubicacion: { 
                          ...prev.ubicacion, 
                          coordenadas: { ...prev.ubicacion.coordenadas, lat: parseFloat(e.target.value) || 0 }
                        }
                      }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        errors.ubicacion?.coordenadas ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="-4.0123"
                      step="0.000001"
                    />
                  </div>

                  <div>
                    <label htmlFor="longitud" className="block text-sm font-medium text-gray-700 mb-2">
                      Longitud *
                    </label>
                    <input
                      type="number"
                      id="longitud"
                      value={formData.ubicacion.coordenadas.lng}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        ubicacion: { 
                          ...prev.ubicacion, 
                          coordenadas: { ...prev.ubicacion.coordenadas, lng: parseFloat(e.target.value) || 0 }
                        }
                      }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        errors.ubicacion?.coordenadas ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="-79.2456"
                      step="0.000001"
                    />
                  </div>
                </div>
                {errors.ubicacion?.coordenadas && <p className="mt-1 text-sm text-red-600">{errors.ubicacion.coordenadas}</p>}
              </div>

              {/* Incluye */}
              <div className="md:col-span-2">
                <label htmlFor="incluye" className="block text-sm font-medium text-gray-700 mb-2">
                  Incluye (separado por comas) *
                </label>
                <input
                  type="text"
                  id="incluye"
                  value={incluyeInput}
                  onChange={(e) => handleIncluyeChange(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    errors.incluye ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Guía especializado, Degustación, Transporte, Almuerzo"
                />
                {errors.incluye && <p className="mt-1 text-sm text-red-600">{errors.incluye}</p>}
                {formData.incluye.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.incluye.map((item, index) => (
                      <span key={index} className="inline-block bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Requisitos */}
              <div className="md:col-span-2">
                <label htmlFor="requisitos" className="block text-sm font-medium text-gray-700 mb-2">
                  Requisitos (separado por comas) *
                </label>
                <input
                  type="text"
                  id="requisitos"
                  value={requisitosInput}
                  onChange={(e) => handleRequisitosChange(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    errors.requisitos ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ropa cómoda, Protector solar, Cámara"
                />
                {errors.requisitos && <p className="mt-1 text-sm text-red-600">{errors.requisitos}</p>}
                {formData.requisitos.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.requisitos.map((item, index) => (
                      <span key={index} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Estado */}
              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData(prev => ({ ...prev, activo: e.target.checked }))}
                    className="mr-2 h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Experiencia activa</span>
                </label>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Guardando...' : experiencia ? 'Actualizar' : 'Crear'} Experiencia
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 