import type { Producto } from './catalogo.types';

// Para el cuestionario inicial
export interface PreguntaRecomendacion {
  id: string;
  texto: string;
  opciones: OpcionRespuesta[];
  peso: number; // importancia de la pregunta
  categoria: string;
}

export interface OpcionRespuesta {
  id: string;
  texto: string;
  valor: number; // para calcular recomendación
  categoria: string;
}

export interface RespuestasUsuario {
  idUsuario: string;
  respuestas: {
    idPregunta: string;
    idOpcion: string;
  }[];
  fechaCompletado: Date;
}

// Resultado de la IA
export interface RecomendacionIA {
  idUsuario: string;
  productosRecomendados: ProductoRecomendado[];
  fechaGenerada: Date;
  activa: boolean;
}

export interface ProductoRecomendado {
  producto: Producto;
  puntuacion: number; // 0-100
  razon: string; // por qué se recomienda
  nivelConfianza: number; // 0-1
}

// Perfil del usuario basado en sus respuestas
export interface PerfilSabor {
  idUsuario: string;
  preferencias: {
    intensidad: number; // 1-5
    acidez: number; // 1-5
    dulzura: number; // 1-5
    amargor: number; // 1-5
    saboresFavoritos: string[];
    nivelesTostadoPreferidos: string[];
  };
  completado: boolean;
  ultimaActualizacion: Date;
}

// Cuestionario completo
export interface Cuestionario {
  id: string;
  version: string;
  titulo: string;
  descripcion: string;
  preguntas: PreguntaRecomendacion[];
  activo: boolean;
  tiempoEstimado: number; // en minutos
}

// Estado del cuestionario para el usuario
export interface EstadoCuestionario {
  idUsuario: string;
  idCuestionario: string;
  preguntaActual: number;
  respuestasTemporales: {
    idPregunta: string;
    idOpcion: string;
  }[];
  fechaInicio: Date;
  completado: boolean;
} 