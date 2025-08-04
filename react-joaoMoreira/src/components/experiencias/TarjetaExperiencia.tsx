import type { Experiencia } from '../../types';

interface TarjetaExperienciaProps {
  experiencia: Experiencia;
  onClick?: (experiencia: Experiencia) => void;
}

export function TarjetaExperiencia({ experiencia, onClick }: TarjetaExperienciaProps) {
  
  const handleClick = () => {
    if (onClick) {
      onClick(experiencia);
    }
  };

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
    }).format(precio);
  };

  const formatearDuracion = (horas: number) => {
    if (horas < 1) {
      return `${Math.round(horas * 60)} minutos`;
    } else if (horas === 1) {
      return '1 hora';
    } else {
      return `${horas} horas`;
    }
  };

  const getDificultadColor = (dificultad: string) => {
    switch (dificultad) {
      case 'facil': return '#4CAF50';
      case 'moderado': return '#FF9800';
      case 'dificil': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getDificultadTexto = (dificultad: string) => {
    switch (dificultad) {
      case 'facil': return 'Fácil';
      case 'moderado': return 'Moderado';
      case 'dificil': return 'Difícil';
      default: return dificultad;
    }
  };

  const getTipoTexto = (tipo: string) => {
    switch (tipo) {
      case 'tour-finca': return 'Tour por Finca';
      case 'cata-cafe': return 'Cata de Café';
      case 'taller-barista': return 'Taller Barista';
      case 'cosecha': return 'Cosecha';
      case 'proceso': return 'Proceso';
      default: return tipo;
    }
  };

  return (
    <div 
      className="tarjeta-experiencia"
      onClick={handleClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="experiencia-imagen">
        <img 
          src={experiencia.imagen_url} 
          alt={experiencia.titulo}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x250?text=Experiencia';
          }}
        />
        <div className="experiencia-badges">
          <span 
            className="dificultad-badge"
            style={{ backgroundColor: getDificultadColor(experiencia.dificultad) }}
          >
            {getDificultadTexto(experiencia.dificultad)}
          </span>
          <span className="tipo-badge">
            {getTipoTexto(experiencia.tipo)}
          </span>
        </div>
      </div>

      <div className="experiencia-info">
        <div className="experiencia-header">
          <h3 className="experiencia-titulo">{experiencia.titulo}</h3>
          <div className="experiencia-rating">
            ⭐ {experiencia.calificacion.toFixed(1)}
          </div>
        </div>

        <div className="experiencia-ubicacion">
          📍 {experiencia.ubicacion.ciudad}, {experiencia.ubicacion.direccion}
        </div>

        <div className="experiencia-descripcion">
          <p>{experiencia.descripcion}</p>
        </div>

        <div className="experiencia-detalles">
          <div className="detalle-item">
            <span className="icono">⏱️</span>
            <span>{formatearDuracion(experiencia.duracion)}</span>
          </div>
          
          <div className="detalle-item">
            <span className="icono">👥</span>
            <span>Máx. {experiencia.capacidadMaxima} personas</span>
          </div>
          
          {experiencia.edadMinima && (
            <div className="detalle-item">
              <span className="icono">🔞</span>
              <span>+{experiencia.edadMinima} años</span>
            </div>
          )}
        </div>

        <div className="experiencia-incluye">
          <h4>✅ Incluye:</h4>
          <ul>
            {experiencia.incluye.slice(0, 3).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
            {experiencia.incluye.length > 3 && (
              <li>+{experiencia.incluye.length - 3} más...</li>
            )}
          </ul>
        </div>

        <div className="experiencia-footer">
          <div className="precio-info">
            <span className="precio">{formatearPrecio(experiencia.precio)}</span>
            <span className="precio-descripcion">por persona</span>
          </div>

          <button 
            className="btn-reservar"
            onClick={handleClick}
          >
            🔍 Ver detalles
          </button>
        </div>
      </div>
    </div>
  );
} 