import { useEffect, useState } from 'react';
import { ExperienciasService } from '../../services/experienciasService';
import type { Experiencia } from '../../types';
import { TarjetaExperiencia } from './TarjetaExperiencia';

export function ListaExperiencias() {
  const [experiencias, setExperiencias] = useState<Experiencia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string>('');
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [filtroUbicacion, setFiltroUbicacion] = useState<string>('');

  useEffect(() => {
    cargarExperiencias();
  }, []);

  const cargarExperiencias = async () => {
    try {
      setCargando(true);
      setError('');
      const experienciasData = await ExperienciasService.obtenerExperiencias();
      setExperiencias(experienciasData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar experiencias');
      console.error('Error:', err);
    } finally {
      setCargando(false);
    }
  };

  const experienciasFiltradas = experiencias.filter(experiencia => {
    const coincideTipo = !filtroTipo || experiencia.tipo === filtroTipo;
    const coincideUbicacion = !filtroUbicacion || experiencia.ubicacion.ciudad.toLowerCase().includes(filtroUbicacion.toLowerCase());
    return coincideTipo && coincideUbicacion;
  });

  const tiposDisponibles = [...new Set(experiencias.map(exp => exp.tipo))];
  const ubicacionesDisponibles = [...new Set(experiencias.map(exp => exp.ubicacion.ciudad))];

  if (error) {
    return (
      <div className="experiencias-error">
        <h3>❌ Error al cargar experiencias</h3>
        <p>{error}</p>
        <button onClick={cargarExperiencias}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="experiencias-container">
      <div className="experiencias-header">
        <h1>🌄 Experiencias Cafeteras Ecuatorianas</h1>
        <p>Descubre el mundo del café con tours únicos por las mejores fincas del Ecuador</p>
      </div>

      <div className="experiencias-filtros">
        <div className="filtro-grupo">
          <label>🔍 Tipo de experiencia:</label>
          <select 
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="filtro-select"
          >
            <option value="">Todas</option>
            {tiposDisponibles.map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>

        <div className="filtro-grupo">
          <label>📍 Ubicación:</label>
          <select 
            value={filtroUbicacion}
            onChange={(e) => setFiltroUbicacion(e.target.value)}
            className="filtro-select"
          >
            <option value="">Todas</option>
            {ubicacionesDisponibles.map(ubicacion => (
              <option key={ubicacion} value={ubicacion}>{ubicacion}</option>
            ))}
          </select>
        </div>

        {(filtroTipo || filtroUbicacion) && (
          <button 
            className="btn-limpiar-filtros"
            onClick={() => {
              setFiltroTipo('');
              setFiltroUbicacion('');
            }}
          >
            ✕ Limpiar filtros
          </button>
        )}
      </div>

      {cargando ? (
        <div className="experiencias-loading">
          <div className="loading-spinner">🔄 Cargando experiencias...</div>
        </div>
      ) : (
        <>
          <div className="experiencias-info">
            <span>{experienciasFiltradas.length} experiencias disponibles</span>
          </div>

          <div className="experiencias-grid">
            {experienciasFiltradas.map((experiencia) => (
              <TarjetaExperiencia 
                key={experiencia.id} 
                experiencia={experiencia}
              />
            ))}
          </div>

          {experienciasFiltradas.length === 0 && !cargando && (
            <div className="no-experiencias">
              <h3>🔍 No se encontraron experiencias</h3>
              <p>Intenta cambiar los filtros de búsqueda</p>
            </div>
          )}
        </>
      )}
    </div>
  );
} 