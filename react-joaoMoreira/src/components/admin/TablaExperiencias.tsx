import React, { useState } from 'react';
import type { Experiencia } from '../../types';

interface TablaExperienciasProps {
  experiencias: Experiencia[];
  isLoading: boolean;
  onEditar: (experiencia: Experiencia) => void;
  onEliminar: (id: string) => void;
  onRestaurar: (id: string) => void;
  onEliminarPermanente: (id: string) => void;
  onRefresh: () => void;
}

type FiltroEstado = 'todas' | 'activas' | 'inactivas';

export const TablaExperiencias: React.FC<TablaExperienciasProps> = ({
  experiencias,
  isLoading,
  onEditar,
  onEliminar,
  onRestaurar,
  onEliminarPermanente,
  onRefresh
}) => {
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todas');
  const [busqueda, setBusqueda] = useState('');

  // Filtrar experiencias
  const experienciasFiltradas = experiencias.filter(experiencia => {
    const coincideBusqueda = experiencia.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
                            experiencia.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
                            experiencia.tipo.toLowerCase().includes(busqueda.toLowerCase());
    
    const coincideEstado = filtroEstado === 'todas' || 
                          (filtroEstado === 'activas' && experiencia.activo) ||
                          (filtroEstado === 'inactivas' && !experiencia.activo);
    
    return coincideBusqueda && coincideEstado;
  });

  const handleEliminar = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta experiencia?')) {
      onEliminar(id);
    }
  };

  const handleRestaurar = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas restaurar esta experiencia?')) {
      onRestaurar(id);
    }
  };

  const handleEliminarPermanente = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar permanentemente esta experiencia? Esta acción no se puede deshacer.')) {
      onEliminarPermanente(id);
    }
  };

  const obtenerEtiquetaTipo = (tipo: string) => {
    const tipos: Record<string, string> = {
      'tour-finca': 'Tour de Finca',
      'cata-cafe': 'Cata de Café',
      'taller-barista': 'Taller de Barista',
      'cosecha': 'Cosecha',
      'proceso': 'Proceso'
    };
    return tipos[tipo] || tipo;
  };

  const obtenerEtiquetaDificultad = (dificultad: string) => {
    const dificultades: Record<string, string> = {
      'facil': 'Fácil',
      'moderado': 'Moderado',
      'dificil': 'Difícil'
    };
    return dificultades[dificultad] || dificultad;
  };

  const obtenerColorDificultad = (dificultad: string) => {
    const colores: Record<string, string> = {
      'facil': 'bg-green-100 text-green-800',
      'moderado': 'bg-yellow-100 text-yellow-800',
      'dificil': 'bg-red-100 text-red-800'
    };
    return colores[dificultad] || 'bg-gray-100 text-gray-800';
  };

  const formatearDuracion = (minutos: number) => {
    if (minutos < 60) {
      return `${minutos} min`;
    } else {
      const horas = Math.floor(minutos / 60);
      const minutosRestantes = minutos % 60;
      return minutosRestantes > 0 ? `${horas}h ${minutosRestantes}min` : `${horas}h`;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header con filtros */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Gestionar Experiencias</h3>
            <p className="text-sm text-gray-600">
              {experienciasFiltradas.length} experiencia{experienciasFiltradas.length !== 1 ? 's' : ''} 
              {filtroEstado !== 'todas' && ` (${filtroEstado})`}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Buscador */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar experiencias..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Filtro por estado */}
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as FiltroEstado)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-label="Filtrar experiencias por estado"
            >
              <option value="todas">Todas</option>
              <option value="activas">Activas</option>
              <option value="inactivas">Inactivas</option>
            </select>

            {/* Botón refresh */}
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              title="Actualizar lista"
              aria-label="Actualizar lista de experiencias"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Experiencia
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dificultad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duración
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Calificación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {experienciasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                  {busqueda ? 'No se encontraron experiencias que coincidan con tu búsqueda' : 'No hay experiencias disponibles'}
                </td>
              </tr>
            ) : (
              experienciasFiltradas.map((experiencia) => (
                <tr key={experiencia.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-12 w-12 flex-shrink-0">
                        <img
                          className="h-12 w-12 rounded-lg object-cover"
                          src={experiencia.imagen_url}
                          alt={experiencia.titulo}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/48x48?text=No+Image';
                          }}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {experiencia.titulo}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {experiencia.ubicacion?.ciudad || 'Ubicación no especificada'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {obtenerEtiquetaTipo(experiencia.tipo)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${obtenerColorDificultad(experiencia.dificultad)}`}>
                      {obtenerEtiquetaDificultad(experiencia.dificultad)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatearDuracion(experiencia.duracion)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${experiencia.precio.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`h-4 w-4 ${i < Math.floor(experiencia.calificacion) ? 'fill-current' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {experiencia.calificacion.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      experiencia.activo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {experiencia.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {/* Botón Editar */}
                      <button
                        onClick={() => onEditar(experiencia)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Editar experiencia"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      {experiencia.activo ? (
                        <>
                          {/* Botón Eliminar (soft delete) */}
                          <button
                            onClick={() => handleEliminar(experiencia.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Eliminar experiencia"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>
                      ) : (
                        <>
                          {/* Botón Restaurar */}
                          <button
                            onClick={() => handleRestaurar(experiencia.id)}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="Restaurar experiencia"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                          
                          {/* Botón Eliminar Permanente */}
                          <button
                            onClick={() => handleEliminarPermanente(experiencia.id)}
                            className="text-red-800 hover:text-red-900 p-1 rounded"
                            title="Eliminar permanentemente"
                          >
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 