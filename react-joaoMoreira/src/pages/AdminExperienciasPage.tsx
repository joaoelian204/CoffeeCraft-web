import React, { useEffect, useState } from 'react';
import { FormularioExperiencia } from '../components/admin/FormularioExperiencia';
import { TablaExperiencias } from '../components/admin/TablaExperiencias';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ExperienciasService } from '../services/experienciasService';
import type {
    EstadisticasExperiencias,
    Experiencia,
    ExperienciaInput
} from '../types';

export const AdminExperienciasPage: React.FC = () => {
  const [experiencias, setExperiencias] = useState<Experiencia[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasExperiencias | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [experienciaEditando, setExperienciaEditando] = useState<Experiencia | undefined>();
  const [error, setError] = useState<string | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [experienciasData, estadisticasData] = await Promise.all([
        ExperienciasService.obtenerTodasLasExperiencias(),
        ExperienciasService.obtenerEstadisticas()
      ]);
      
      setExperiencias(experienciasData);
      setEstadisticas(estadisticasData);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCrearExperiencia = async (experienciaInput: ExperienciaInput) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const nuevaExperiencia = await ExperienciasService.crearExperiencia(experienciaInput);
      
      setExperiencias(prev => [nuevaExperiencia, ...prev]);
      setMostrarFormulario(false);
      
      // Actualizar estadísticas
      await actualizarEstadisticas();
      
    } catch (err) {
      console.error('Error al crear experiencia:', err);
      setError('Error al crear la experiencia. Intenta nuevamente.');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditarExperiencia = async (experienciaInput: ExperienciaInput) => {
    if (!experienciaEditando) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const experienciaActualizada = await ExperienciasService.actualizarExperiencia(
        experienciaEditando.id,
        experienciaInput
      );
      
      setExperiencias(prev => 
        prev.map(exp => exp.id === experienciaEditando.id ? experienciaActualizada : exp)
      );
      
      setMostrarFormulario(false);
      setExperienciaEditando(undefined);
      
      // Actualizar estadísticas
      await actualizarEstadisticas();
      
    } catch (err) {
      console.error('Error al editar experiencia:', err);
      setError('Error al editar la experiencia. Intenta nuevamente.');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEliminarExperiencia = async (id: string) => {
    try {
      setError(null);
      await ExperienciasService.eliminarExperiencia(id);
      
      setExperiencias(prev => 
        prev.map(exp => exp.id === id ? { ...exp, activo: false } : exp)
      );
      
      // Actualizar estadísticas
      await actualizarEstadisticas();
      
    } catch (err) {
      console.error('Error al eliminar experiencia:', err);
      setError('Error al eliminar la experiencia. Intenta nuevamente.');
    }
  };

  const handleRestaurarExperiencia = async (id: string) => {
    try {
      setError(null);
      await ExperienciasService.restaurarExperiencia(id);
      
      setExperiencias(prev => 
        prev.map(exp => exp.id === id ? { ...exp, activo: true } : exp)
      );
      
      // Actualizar estadísticas
      await actualizarEstadisticas();
      
    } catch (err) {
      console.error('Error al restaurar experiencia:', err);
      setError('Error al restaurar la experiencia. Intenta nuevamente.');
    }
  };

  const handleEliminarPermanente = async (id: string) => {
    try {
      setError(null);
      await ExperienciasService.eliminarExperienciaPermanente(id);
      
      setExperiencias(prev => prev.filter(exp => exp.id !== id));
      
      // Actualizar estadísticas
      await actualizarEstadisticas();
      
    } catch (err) {
      console.error('Error al eliminar permanentemente:', err);
      setError('Error al eliminar permanentemente la experiencia. Intenta nuevamente.');
    }
  };

  const actualizarEstadisticas = async () => {
    try {
      const estadisticasData = await ExperienciasService.obtenerEstadisticas();
      setEstadisticas(estadisticasData);
    } catch (err) {
      console.error('Error al actualizar estadísticas:', err);
    }
  };

  const abrirFormularioCrear = () => {
    setExperienciaEditando(undefined);
    setMostrarFormulario(true);
  };

  const abrirFormularioEditar = (experiencia: Experiencia) => {
    setExperienciaEditando(experiencia);
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setExperienciaEditando(undefined);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Administración de Experiencias</h1>
              <p className="text-gray-600 mt-2">Gestiona las experiencias de café disponibles</p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={abrirFormularioCrear}
                className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nueva Experiencia
              </button>
            </div>
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Estadísticas */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total de experiencias */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Experiencias</p>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.totalExperiencias}</p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                <span className="text-green-600 font-medium">{estadisticas.experienciasActivas}</span> activas, 
                <span className="text-red-600 font-medium ml-1">{estadisticas.experienciasInactivas}</span> inactivas
              </div>
            </div>

            {/* Calificación promedio */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Calificación Promedio</p>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.calificacionPromedio}</p>
                </div>
                <div className="bg-yellow-100 rounded-full p-3">
                  <svg className="h-6 w-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Basado en {estadisticas.totalReservas} reservas
              </div>
            </div>

            {/* Total de reservas */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Reservas</p>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.totalReservas}</p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h5.586a1 1 0 00.707-.293l5.414-5.414a1 1 0 00.293-.707V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {estadisticas.proximasFechas} fechas próximas
              </div>
            </div>

            {/* Ingresos totales */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-gray-900">${estadisticas.ingresosTotales.toFixed(2)}</p>
                </div>
                <div className="bg-amber-100 rounded-full p-3">
                  <svg className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                De todas las reservas
              </div>
            </div>
          </div>
        )}

        {/* Gráficos de distribución */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Experiencias por tipo */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Experiencias por Tipo</h3>
              <div className="space-y-3">
                {Object.entries(estadisticas.experienciasPorTipo).map(([tipo, cantidad]) => (
                  <div key={tipo} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 capitalize">
                      {tipo.replace('-', ' ')}
                    </span>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      </div>
                      <span className="text-sm font-semibold text-gray-900 min-w-8">{cantidad}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Experiencias por dificultad */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Experiencias por Dificultad</h3>
              <div className="space-y-3">
                {Object.entries(estadisticas.experienciasPorDificultad).map(([dificultad, cantidad]) => (
                  <div key={dificultad} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 capitalize">
                      {dificultad}
                    </span>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${
                            dificultad === 'facil' ? 'bg-green-600' :
                            dificultad === 'moderado' ? 'bg-yellow-600' : 'bg-red-600'
                          }`}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 min-w-8">{cantidad}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tabla de experiencias */}
        <TablaExperiencias
          experiencias={experiencias}
          isLoading={false}
          onEditar={abrirFormularioEditar}
          onEliminar={handleEliminarExperiencia}
          onRestaurar={handleRestaurarExperiencia}
          onEliminarPermanente={handleEliminarPermanente}
          onRefresh={cargarDatos}
        />

        {/* Formulario modal */}
        {mostrarFormulario && (
          <FormularioExperiencia
            experiencia={experienciaEditando}
            onSubmit={experienciaEditando ? handleEditarExperiencia : handleCrearExperiencia}
            onCancel={cerrarFormulario}
            isLoading={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}; 