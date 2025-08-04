export interface IRegionCafetera {
  id_region: string;
  nombre: string;
  pais: string;
  coordenadas: {
    latitud: number;
    longitud: number;
  };
  altitud: number;
  descripcion: string;
  variedades_cafe: string[];
  temporada_cosecha: {
    inicio: string; // formato MM-DD
    fin: string;   // formato MM-DD
  };
  imagen_url: string;
  activa: boolean;
}

export interface IDatosClima {
  id_region: string;
  region: IRegionCafetera | null;
  actual: {
    temperatura: number;
    sensacion_termica: number;
    humedad: number;
    precipitacion: number;
    velocidad_viento: number;
    direccion_viento: string;
    presion: number;
    indice_uv: number;
    visibilidad: number;
    nubosidad: number;
    condicion: string;
    icono: string;
  };
  pronostico: IPronosticoDiario[];
  actualizado_en: Date;
}

export interface IPronosticoDiario {
  fecha: Date;
  temperatura: {
    minima: number;
    maxima: number;
  };
  humedad: number;
  precipitacion: {
    probabilidad: number;
    cantidad: number;
  };
  velocidad_viento: number;
  condicion: string;
  icono: string;
}

export interface IAlertaClimatica {
  id: string;
  id_region: string;
  tipo: 'advertencia' | 'vigilancia' | 'aviso';
  severidad: 'menor' | 'moderada' | 'grave' | 'extrema';
  titulo: string;
  descripcion: string;
  inicio: Date;
  fin: Date;
  activa: boolean;
}

export interface IimpactoClimatico {
  id_region: string;
  nivel_impacto: 'bajo' | 'moderado' | 'alto' | 'severo';
  factores: {
    temperatura: 'óptima' | 'subóptima' | 'pobre';
    precipitacion: 'óptima' | 'subóptima' | 'pobre';
    humedad: 'óptima' | 'subóptima' | 'pobre';
  };
  recomendaciones: string[];
  prediccion_calidad: 'excelente' | 'buena' | 'promedio' | 'pobre';
  impacto_cosecha: string;
}