// Tipos para experiencias usando const assertions
export const TipoExperiencia = {
  TOUR_FINCA: 'tour-finca',
  CATA_CAFE: 'cata-cafe',
  TALLER_BARISTA: 'taller-barista',
  COSECHA: 'cosecha',
  PROCESO: 'proceso'
} as const;

export type TipoExperiencia = typeof TipoExperiencia[keyof typeof TipoExperiencia];

export const DificultadExperiencia = {
  FACIL: 'facil',
  MODERADO: 'moderado',
  DIFICIL: 'dificil'
} as const;

export type DificultadExperiencia = typeof DificultadExperiencia[keyof typeof DificultadExperiencia];

export const EstadoReserva = {
  PENDIENTE: 'pendiente',
  CONFIRMADA: 'confirmada',
  PAGADA: 'pagada',
  COMPLETADA: 'completada',
  CANCELADA: 'cancelada'
} as const;

export type EstadoReserva = typeof EstadoReserva[keyof typeof EstadoReserva];
// Para cupones de descuento
export interface CuponExperiencia {
    id: string;
    codigo: string;
    descripcion: string;
    descuento: number;
    tipoDescuento: 'porcentaje' | 'fijo';
    experienciasAplicables: string[];
    fechaInicio: Date;
    fechaVencimiento: Date;
    usosMaximos: number;
    usosActuales: number;
    activo: boolean;
  }

  // Para políticas de cancelación
export interface PoliticaCancelacion {
    id: string;
    idExperiencia: string;
    diasAntesCancelacion: number;
    porcentajeReembolso: number;
    politica: string;
    activo: boolean;
  }
// Experiencia/Tour principal
export interface Experiencia {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: TipoExperiencia;
  precio: number;
  duracion: number; // en minutos
  dificultad: DificultadExperiencia;
  imagen_url: string;
  galeria?: string[];
  capacidadMaxima: number;
  edadMinima?: number;
  incluye: string[];
  ubicacion: {
    ciudad: string;
    direccion: string;
    coordenadas: {
      lat: number;
      lng: number;
    };
  };
  requisitos: string[];
  calificacion: number;
  cantidad_resenas: number;
  activo: boolean;
}

// Para cancelación de tours
export interface CancelacionTour {
  id: string;
  idReserva: string;
  idUsuario: string;
  experiencia: {
    titulo: string;
    fecha: Date;
    horaInicio: string;
  };
  motivo: MotivoCancelacionTour;
  descripcionMotivo?: string;
  fechaCancelacion: Date;
  fechaExperiencia: Date;
  diasAnticipacion: number;
  montoReembolso: number;
  porcentajeReembolso: number;
  penalizacion: number;
  estadoReembolso: EstadoReembolsoTour;
  fechaReembolso?: Date;
  observacionesAdmin?: string;
  aprobadoPor?: string;
}

export const MotivoCancelacionTour = {
  EMERGENCIA_PERSONAL: 'emergencia-personal',
  ENFERMEDAD: 'enfermedad',
  CAMBIO_PLANES: 'cambio-planes',
  PROBLEMA_TRANSPORTE: 'problema-transporte',
  MAL_CLIMA: 'mal-clima',
  INSATISFACCION_SERVICIO: 'insatisfaccion-servicio',
  ERROR_RESERVA: 'error-reserva',
  OTROS: 'otros'
} as const;

export type MotivoCancelacionTour = typeof MotivoCancelacionTour[keyof typeof MotivoCancelacionTour];

export const EstadoReembolsoTour = {
  PENDIENTE: 'pendiente',
  PROCESANDO: 'procesando',
  COMPLETADO: 'completado',
  RECHAZADO: 'rechazado',
  PARCIAL: 'parcial'
} as const;

export type EstadoReembolsoTour = typeof EstadoReembolsoTour[keyof typeof EstadoReembolsoTour];

// Política de cancelación por experiencia
export interface PoliticaCancelacion {
  id: string;
  idExperiencia: string;
  reglas: ReglaCancelacion[];
  politicaGeneral: string;
  activo: boolean;
}

export interface ReglaCancelacion {
  diasMinimos: number;
  diasMaximos?: number;
  porcentajeReembolso: number;
  penalizacion: number;
  descripcion: string;
}

// Para solicitar cancelación desde el frontend
export interface SolicitudCancelacionTour {
  idReserva: string;
  motivo: MotivoCancelacionTour;
  descripcionMotivo?: string;
  confirmacion: boolean; // usuario acepta términos
  aceptaPenalizacion: boolean;
}

// Fechas disponibles para tours
export interface FechaTour {
  id: string;
  idExperiencia: string;
  fecha: Date;
  horaInicio: string;
  horaFin: string;
  cuposDisponibles: number;
  cuposReservados: number;
  precio: number;
  guia: {
    nombre: string;
    telefono: string;
    experiencia: string;
  };
  puntoEncuentro: string;
  observaciones?: string;
}

// Reserva de tour
export interface ReservaTour {
  id: string;
  idUsuario: string;
  idFechaTour: string;
  experiencia: {
    titulo: string;
    fecha: Date;
    horaInicio: string;
    ubicacion: string;
  };
  cantidadPersonas: number;
  participantes: Participante[];
  precioTotal: number;
  estado: EstadoReserva;
  observaciones?: string;
  codigoConfirmacion: string;
  fechaReserva: Date;
  metodoPago?: string;
}

export interface Participante {
  nombre: string;
  edad: number;
  documento: string;
  telefono?: string;
  requerimientosEspeciales?: string;
}

// Para filtrar experiencias
export interface FiltrosExperiencias {
  tipo?: TipoExperiencia;
  dificultad?: DificultadExperiencia;
  precioMin?: number;
  precioMax?: number;
  duracionMax?: number;
  ciudad?: string;
  fecha?: Date;
  disponibilidad?: boolean;
  busqueda?: string;
}

// Página de tours - resumen
export interface ResumenTour {
  experiencia: Experiencia;
  fechasDisponibles: FechaTour[];
  proximaFecha?: FechaTour;
  totalReservas: number;
  disponibilidadGeneral: boolean;
}

// Información de la finca
export interface Finca {
  id: string;
  nombre: string;
  descripcion: string;
  propietario: string;
  ubicacion: {
    direccion: string;
    ciudad: string;
    provincia: string;
    coordenadas: {
      lat: number;
      lng: number;
    };
  };
  imagenes: string[];
  experienciasDisponibles: string[];
  variedadesCafe: string[];
  altitud: number;
  areaTotal: number; // hectáreas
  calificacion: number;
  activo: boolean;
}

// ================================
// TIPOS PARA OPERACIONES CRUD
// ================================

// Input para crear/editar experiencias
export interface ExperienciaInput {
  titulo: string;
  descripcion: string;
  tipo: TipoExperiencia;
  dificultad: DificultadExperiencia;
  duracion: number; // en minutos
  precio: number;
  imagen_url: string;
  ubicacion: {
    ciudad: string;
    direccion: string;
    coordenadas: {
      lat: number;
      lng: number;
    };
  };
  incluye: string[];
  requisitos: string[];
  calificacion?: number;
  cantidad_resenas?: number;
  activo?: boolean;
}

// Input para crear/editar fechas de tours
export interface FechaTourInput {
  id_experiencia: string;
  fecha: string; // formato YYYY-MM-DD
  hora_inicio: string; // formato HH:MM
  hora_fin: string; // formato HH:MM
  precio: number;
  cupos_totales: number;
  cupos_reservados?: number;
  cupos_disponibles: number;
  punto_encuentro: string;
  instrucciones_especiales?: string;
  activo?: boolean;
}

// Estadísticas de experiencias
export interface EstadisticasExperiencias {
  totalExperiencias: number;
  experienciasActivas: number;
  experienciasInactivas: number;
  calificacionPromedio: number;
  totalReservas: number;
  ingresosTotales: number;
  proximasFechas: number;
  experienciasPorTipo: Record<TipoExperiencia, number>;
  experienciasPorDificultad: Record<DificultadExperiencia, number>;
} 