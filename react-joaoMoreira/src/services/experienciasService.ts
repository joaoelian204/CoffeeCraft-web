import { supabase } from '../lib/supabase';
import type {
  DificultadExperiencia,
  EstadisticasExperiencias,
  Experiencia,
  ExperienciaInput,
  FechaTour,
  FechaTourInput,
  FiltrosExperiencias,
  Participante,
  ReservaTour,
  ResumenTour,
  TipoExperiencia
} from '../types';

export class ExperienciasService {
  
  // ================================
  // OPERACIONES CRUD EXPERIENCIAS
  // ================================

  // Crear nueva experiencia
  static async crearExperiencia(experienciaInput: ExperienciaInput) {
    const { data, error } = await supabase
      .from('experiencias')
      .insert({
        ...experienciaInput,
        activo: experienciaInput.activo ?? true,
        calificacion: experienciaInput.calificacion ?? 0.0,
        cantidad_resenas: experienciaInput.cantidad_resenas ?? 0
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error al crear experiencia: ${error.message}`);
    }
    
    return data as Experiencia;
  }

  // Actualizar experiencia existente
  static async actualizarExperiencia(id: string, experienciaInput: Partial<ExperienciaInput>) {
    const { data, error } = await supabase
      .from('experiencias')
      .update(experienciaInput)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error al actualizar experiencia: ${error.message}`);
    }
    
    return data as Experiencia;
  }

  // Eliminar experiencia (soft delete)
  static async eliminarExperiencia(id: string) {
    const { data, error } = await supabase
      .from('experiencias')
      .update({ activo: false })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error al eliminar experiencia: ${error.message}`);
    }
    
    return data as Experiencia;
  }

  // Restaurar experiencia eliminada
  static async restaurarExperiencia(id: string) {
    const { data, error } = await supabase
      .from('experiencias')
      .update({ activo: true })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error al restaurar experiencia: ${error.message}`);
    }
    
    return data as Experiencia;
  }

  // Eliminar experiencia permanentemente
  static async eliminarExperienciaPermanente(id: string) {
    const { error } = await supabase
      .from('experiencias')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new Error(`Error al eliminar experiencia permanentemente: ${error.message}`);
    }
    
    return { mensaje: 'Experiencia eliminada permanentemente' };
  }

  // ================================
  // OPERACIONES CRUD FECHAS TOURS
  // ================================

  // Crear fecha de tour
  static async crearFechaTour(fechaTourInput: FechaTourInput) {
    const { data, error } = await supabase
      .from('fechas_tours')
      .insert({
        ...fechaTourInput,
        activo: fechaTourInput.activo ?? true,
        cupos_reservados: fechaTourInput.cupos_reservados ?? 0
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error al crear fecha de tour: ${error.message}`);
    }
    
    return data as FechaTour;
  }

  // Actualizar fecha de tour
  static async actualizarFechaTour(id: string, fechaTourInput: Partial<FechaTourInput>) {
    const { data, error } = await supabase
      .from('fechas_tours')
      .update(fechaTourInput)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error al actualizar fecha de tour: ${error.message}`);
    }
    
    return data as FechaTour;
  }

  // Eliminar fecha de tour
  static async eliminarFechaTour(id: string) {
    const { error } = await supabase
      .from('fechas_tours')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new Error(`Error al eliminar fecha de tour: ${error.message}`);
    }
    
    return { mensaje: 'Fecha de tour eliminada' };
  }

  // ================================
  // ESTADÍSTICAS Y REPORTES
  // ================================

  // Obtener estadísticas generales
  static async obtenerEstadisticas(): Promise<EstadisticasExperiencias> {
    try {
      // Obtener conteos básicos
      const { data: experiencias, error: errorExperiencias } = await supabase
        .from('experiencias')
        .select('activo, calificacion, tipo, dificultad, precio');
      
      if (errorExperiencias) {
        throw new Error(`Error al obtener experiencias: ${errorExperiencias.message}`);
      }
      
      // Obtener reservas
      const { data: reservas, error: errorReservas } = await supabase
        .from('reservas')
        .select('precio_total, cantidad_personas');
      
      if (errorReservas) {
        throw new Error(`Error al obtener reservas: ${errorReservas.message}`);
      }
      
      // Obtener fechas futuras
      const { count: proximasFechas, error: errorFechas } = await supabase
        .from('fechas_tours')
        .select('*', { count: 'exact', head: true })
        .gte('fecha', new Date().toISOString().split('T')[0])
        .eq('activo', true);
      
      if (errorFechas) {
        throw new Error(`Error al obtener fechas futuras: ${errorFechas.message}`);
      }
      
      // Calcular estadísticas
      const totalExperiencias = experiencias.length;
      const experienciasActivas = experiencias.filter(e => e.activo).length;
      const experienciasInactivas = totalExperiencias - experienciasActivas;
      
      const calificacionPromedio = experiencias.length > 0 
        ? experiencias.reduce((sum, e) => sum + (e.calificacion || 0), 0) / experiencias.length
        : 0;
      
      const totalReservas = reservas.length;
      const ingresosTotales = reservas.reduce((sum, r) => sum + (r.precio_total || 0), 0);
      
      // Conteos por tipo
      const experienciasPorTipo: Record<TipoExperiencia, number> = {
        'tour-finca': 0,
        'cata-cafe': 0,
        'taller-barista': 0,
        'cosecha': 0,
        'proceso': 0
      };
      
      experiencias.forEach(e => {
        if (e.tipo && experienciasPorTipo.hasOwnProperty(e.tipo as TipoExperiencia)) {
          experienciasPorTipo[e.tipo as TipoExperiencia]++;
        }
      });
      
      // Conteos por dificultad
      const experienciasPorDificultad: Record<DificultadExperiencia, number> = {
        'facil': 0,
        'moderado': 0,
        'dificil': 0
      };
      
      experiencias.forEach(e => {
        if (e.dificultad && experienciasPorDificultad.hasOwnProperty(e.dificultad as DificultadExperiencia)) {
          experienciasPorDificultad[e.dificultad as DificultadExperiencia]++;
        }
      });
      
      return {
        totalExperiencias,
        experienciasActivas,
        experienciasInactivas,
        calificacionPromedio: Number(calificacionPromedio.toFixed(2)),
        totalReservas,
        ingresosTotales,
        proximasFechas: proximasFechas || 0,
        experienciasPorTipo,
        experienciasPorDificultad
      };
      
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  // Obtener todas las experiencias para administración (incluyendo inactivas)
  static async obtenerTodasLasExperiencias() {
    const { data, error } = await supabase
      .from('experiencias')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Error al obtener todas las experiencias: ${error.message}`);
    }
    
    return data as Experiencia[];
  }

  // Obtener fechas de tours para una experiencia específica
  static async obtenerFechasDeExperiencia(idExperiencia: string) {
    const { data, error } = await supabase
      .from('fechas_tours')
      .select('*')
      .eq('id_experiencia', idExperiencia)
      .order('fecha', { ascending: true });
    
    if (error) {
      throw new Error(`Error al obtener fechas de experiencia: ${error.message}`);
    }
    
    return data as FechaTour[];
  }

  // Obtener todas las experiencias con filtros
  static async obtenerExperiencias(filtros?: FiltrosExperiencias) {
    let query = supabase
      .from('experiencias')
      .select('*')
      .eq('activo', true);
    
    // Aplicar filtros
    if (filtros?.tipo) {
      query = query.eq('tipo', filtros.tipo);
    }
    
    if (filtros?.dificultad) {
      query = query.eq('dificultad', filtros.dificultad);
    }
    
    if (filtros?.ciudad) {
      query = query.ilike('ubicacion->>ciudad', `%${filtros.ciudad}%`);
    }
    
    if (filtros?.precioMin && filtros?.precioMax) {
      query = query.gte('precio', filtros.precioMin).lte('precio', filtros.precioMax);
    } else if (filtros?.precioMin) {
      query = query.gte('precio', filtros.precioMin);
    } else if (filtros?.precioMax) {
      query = query.lte('precio', filtros.precioMax);
    }
    
    if (filtros?.duracionMax) {
      query = query.lte('duracion', filtros.duracionMax);
    }
    
    if (filtros?.busqueda) {
      query = query.or(`titulo.ilike.%${filtros.busqueda}%,descripcion.ilike.%${filtros.busqueda}%`);
    }
    
    // Ordenar por calificación
    query = query.order('calificacion', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Error al obtener experiencias: ${error.message}`);
    }
    
    return data as Experiencia[];
  }

  // Obtener experiencia por ID
  static async obtenerExperienciaPorId(id: string) {
    const { data, error } = await supabase
      .from('experiencias')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw new Error(`Error al obtener experiencia: ${error.message}`);
    }
    
    return data as Experiencia;
  }

  // Obtener fechas disponibles para una experiencia
  static async obtenerFechasDisponibles(idExperiencia: string) {
    const { data, error } = await supabase
      .from('fechas_tours')
      .select('*')
      .eq('id_experiencia', idExperiencia)
      .gte('fecha', new Date().toISOString().split('T')[0]) // Solo fechas futuras
      .gt('cupos_disponibles', 0) // Solo con cupos disponibles
      .order('fecha', { ascending: true })
      .order('hora_inicio', { ascending: true });
    
    if (error) {
      throw new Error(`Error al obtener fechas: ${error.message}`);
    }
    
    return data as FechaTour[];
  }

  // Obtener resumen de tour (experiencia + fechas)
  static async obtenerResumenTour(idExperiencia: string): Promise<ResumenTour> {
    const experiencia = await this.obtenerExperienciaPorId(idExperiencia);
    const fechasDisponibles = await this.obtenerFechasDisponibles(idExperiencia);
    
    // Obtener total de reservas
    const { count: totalReservas } = await supabase
      .from('reservas')
      .select('*', { count: 'exact', head: true })
      .in('id_fecha_tour', fechasDisponibles.map(f => f.id));
    
    const proximaFecha = fechasDisponibles.length > 0 ? fechasDisponibles[0] : undefined;
    
    return {
      experiencia,
      fechasDisponibles,
      proximaFecha,
      totalReservas: totalReservas || 0,
      disponibilidadGeneral: fechasDisponibles.length > 0
    };
  }

  // Crear reserva de tour
  static async crearReserva(
    idUsuario: string,
    idFechaTour: string,
    cantidadPersonas: number,
    participantes: Participante[],
    observaciones?: string
  ) {
    // Obtener información de la fecha del tour
    const { data: fechaTour, error: errorFecha } = await supabase
      .from('fechas_tours')
      .select('*, experiencias(titulo)')
      .eq('id', idFechaTour)
      .single();
    
    if (errorFecha || !fechaTour) {
      throw new Error('Fecha de tour no encontrada');
    }
    
    // Verificar disponibilidad
    if (fechaTour.cupos_disponibles < cantidadPersonas) {
      throw new Error('No hay suficientes cupos disponibles');
    }
    
    // Generar código de confirmación
    const codigoConfirmacion = `CF-${Date.now().toString().slice(-6)}`;
    
    // Calcular precio total
    const precioTotal = fechaTour.precio * cantidadPersonas;
    
    // Crear la reserva
    const nuevaReserva: Omit<ReservaTour, 'id'> = {
      idUsuario,
      idFechaTour,
      experiencia: {
        titulo: fechaTour.experiencias.titulo,
        fecha: new Date(fechaTour.fecha),
        horaInicio: fechaTour.hora_inicio,
        ubicacion: `${fechaTour.punto_encuentro}`
      },
      cantidadPersonas,
      participantes,
      precioTotal,
      estado: 'pendiente',
      observaciones,
      codigoConfirmacion,
      fechaReserva: new Date(),
      metodoPago: undefined
    };
    
    const { data, error } = await supabase
      .from('reservas')
      .insert(nuevaReserva)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error al crear reserva: ${error.message}`);
    }
    
    // Actualizar cupos disponibles
    await supabase
      .from('fechas_tours')
      .update({ 
        cupos_reservados: fechaTour.cupos_reservados + cantidadPersonas,
        cupos_disponibles: fechaTour.cupos_disponibles - cantidadPersonas
      })
      .eq('id', idFechaTour);
    
    return data as ReservaTour;
  }

  // Obtener reservas del usuario
  static async obtenerReservasUsuario(idUsuario: string) {
    const { data, error } = await supabase
      .from('reservas')
      .select(`
        *,
        fechas_tours (
          *,
          experiencias (titulo, imagen_url)
        )
      `)
      .eq('id_usuario', idUsuario)
      .order('fecha_reserva', { ascending: false });
    
    if (error) {
      throw new Error(`Error al obtener reservas: ${error.message}`);
    }
    
    return data;
  }

  // Cancelar reserva
  static async cancelarReserva(idReserva: string, motivo: string) {
    const { data, error } = await supabase
      .from('reservas')
      .update({ 
        estado: 'cancelada',
        observaciones: motivo 
      })
      .eq('id', idReserva)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error al cancelar reserva: ${error.message}`);
    }
    
    return data;
  }
}