import { supabase } from '../lib/supabase';
import { authService } from './authService';
import type {
    Cuestionario,
    PerfilSabor,
    ProductoRecomendado,
    RecomendacionIA,
    RespuestasUsuario
} from '../types';

export class RecomendacionService {
  
  // Obtener cuestionario activo desde Supabase
  static async obtenerCuestionario(): Promise<Cuestionario> {
    const { data, error } = await supabase
      .from('cuestionarios')
      .select('*')
      .eq('activo', true)
      .order('version', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      throw new Error(`Error al obtener cuestionario: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('No hay cuestionarios activos disponibles');
    }
    
    return data as Cuestionario;
  }

  // Guardar respuestas del cuestionario
  static async guardarRespuestas(respuestas: RespuestasUsuario, idCuestionario: string) {
    console.log('🔄 Guardando respuestas del cuestionario...');
    
    // Obtener usuario autenticado desde el shell
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('No hay usuario autenticado');
    }

    console.log('👤 Usuario autenticado:', currentUser.id);
    console.log('🔍 Token a enviar:', currentUser.token);
    console.log('🔍 Token length:', currentUser.token?.length);
    console.log('🔍 Token parts:', currentUser.token?.split('.').length);
    console.log('🔍 Token válido:', currentUser.token && currentUser.token.split('.').length === 3);
    console.log('🔍 Token completo:', currentUser.token);

    // Usar fetch con el token JWT para guardar las respuestas
    const response = await fetch('https://aydbyfxeudluyscfjxqp.supabase.co/rest/v1/respuestas_cuestionario?select=*', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentUser.token}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5ZGJ5ZnhldWRsdXlzY2ZqeHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NTY2NzAsImV4cCI6MjA2NzQzMjY3MH0.dH09IlJkCw5GuVeBan7JKXeQ-5mEV53CzfGTuKnazY8',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        usuario_id: respuestas.idUsuario,
        cuestionario_id: idCuestionario,
        respuestas: respuestas.respuestas,
        fecha_completado: respuestas.fechaCompletado.toISOString()
      })
    });

    console.log('📋 Respuesta del servidor:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en respuesta:', errorText);
      throw new Error(`Error al guardar respuestas: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Respuestas guardadas exitosamente:', data);
    
    return data;
  }

  // Generar perfil de sabor basado en respuestas
  static async generarPerfilSabor(respuestas: RespuestasUsuario): Promise<PerfilSabor> {
    const cuestionario = await this.obtenerCuestionario();
    
    // Calcular preferencias basadas en respuestas
    let intensidad = 3;
    let acidez = 3;
    let dulzura = 3;
    let amargor = 3;
    const saboresFavoritos: string[] = [];
    const nivelesTostadoPreferidos: string[] = [];
    
    respuestas.respuestas.forEach(respuesta => {
      const pregunta = cuestionario.preguntas.find(p => p.id === respuesta.idPregunta);
      const opcion = pregunta?.opciones?.find(o => o.id === respuesta.idOpcion);
      
      if (pregunta && opcion) {
        switch (pregunta.categoria) {
          case 'intensidad':
            intensidad = opcion.valor;
            break;
          case 'sabor':
            saboresFavoritos.push(opcion.categoria);
            if (opcion.categoria === 'afrutado') acidez = 4;
            if (opcion.categoria === 'chocolate') dulzura = 4;
            if (opcion.categoria === 'especiado') amargor = 4;
            break;
        }
      }
    });
    
    // Determinar niveles de tostado preferidos basado en intensidad
    if (intensidad <= 2) {
      nivelesTostadoPreferidos.push('ligero');
    } else if (intensidad === 3) {
      nivelesTostadoPreferidos.push('medio');
    } else {
      nivelesTostadoPreferidos.push('oscuro');
    }
    
    const perfil: PerfilSabor = {
      idUsuario: respuestas.idUsuario,
      preferencias: {
        intensidad,
        acidez,
        dulzura,
        amargor,
        saboresFavoritos,
        nivelesTostadoPreferidos
      },
      completado: true,
      ultimaActualizacion: new Date()
    };
    
    // Guardar perfil en Supabase usando fetch directo
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('No hay usuario autenticado');
    }

    const response = await fetch('https://aydbyfxeudluyscfjxqp.supabase.co/rest/v1/perfiles_sabor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentUser.token}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5ZGJ5ZnhldWRsdXlzY2ZqeHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NTY2NzAsImV4cCI6MjA2NzQzMjY3MH0.dH09IlJkCw5GuVeBan7JKXeQ-5mEV53CzfGTuKnazY8',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        usuario_id: perfil.idUsuario,
        preferencias: perfil.preferencias,
        completado: perfil.completado,
        ultima_actualizacion: perfil.ultimaActualizacion.toISOString()
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al guardar perfil de sabor: ${errorText}`);
    }
    
    return perfil;
  }

  // Generar recomendaciones basadas en perfil
  static async generarRecomendaciones(idUsuario: string): Promise<RecomendacionIA> {
    console.log('🤖 Generando recomendaciones para usuario:', idUsuario);
    
    // 1. Obtener perfil de sabor del usuario
    console.log('📊 Obteniendo perfil de sabor...');
    const perfilSabor = await this.obtenerPerfilSabor(idUsuario);
    
    // 2. Obtener productos reales de Supabase
    console.log('🛍️ Obteniendo productos de Supabase...');
    const { data: productos, error } = await supabase
      .from('productos')
      .select('*')
      .eq('activo', true)
      .gt('stock', 0)
      .order('calificacion', { ascending: false })
      .limit(20);
    
    if (error) {
      throw new Error(`Error al obtener productos: ${error.message}`);
    }
    
    if (!productos || productos.length === 0) {
      throw new Error('No hay productos disponibles para generar recomendaciones');
    }
    
    // 3. Aplicar algoritmo de recomendación
    console.log('🧠 Aplicando algoritmo de recomendación...');
    const productosRecomendados = this.aplicarAlgoritmoRecomendacion(productos, perfilSabor);
    
    // 4. Crear recomendación
    const recomendacion: RecomendacionIA = {
      idUsuario,
      productosRecomendados: productosRecomendados.slice(0, 3), // Top 3
      fechaGenerada: new Date(),
      activa: true
    };
    
    // 5. Guardar en Supabase usando fetch directo
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('No hay usuario autenticado');
    }

    const response = await fetch('https://aydbyfxeudluyscfjxqp.supabase.co/rest/v1/recomendaciones_personalizadas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentUser.token}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5ZGJ5ZnhldWRsdXlzY2ZqeHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NTY2NzAsImV4cCI6MjA2NzQzMjY3MH0.dH09IlJkCw5GuVeBan7JKXeQ-5mEV53CzfGTuKnazY8',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        usuario_id: recomendacion.idUsuario,
        productos_recomendados: recomendacion.productosRecomendados,
        fecha_generada: recomendacion.fechaGenerada.toISOString(),
        activa: recomendacion.activa
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al guardar recomendación: ${errorText}`);
    }
    
    console.log('✅ Recomendaciones generadas exitosamente:', recomendacion);
    return recomendacion;
  }

  // Algoritmo de recomendación basado en perfil de sabor
  private static aplicarAlgoritmoRecomendacion(productos: any[], perfilSabor: any): ProductoRecomendado[] {
    return productos.map(producto => {
      let puntuacion = 50; // Base
      let razon = '';
      
      // Si no hay perfil, usar calificación del producto
      if (!perfilSabor) {
        puntuacion = Math.round(producto.calificacion * 20); // 4.5 -> 90%
        razon = `Altamente calificado por otros usuarios con ${producto.calificacion}/5 estrellas`;
      } else {
        const preferencias = perfilSabor.preferencias;
        
        // Algoritmo basado en preferencias
        if (preferencias.nivelesTostadoPreferidos?.includes(producto.nivel_tostado)) {
          puntuacion += 25;
        }
        
        if (preferencias.saboresFavoritos?.some((sabor: string) => 
          producto.notas_sabor?.some((nota: string) => nota.toLowerCase().includes(sabor))
        )) {
          puntuacion += 20;
        }
        
        // Ajustar por intensidad
        if (producto.nivel_tostado === 'ligero' && preferencias.intensidad <= 2) puntuacion += 15;
        if (producto.nivel_tostado === 'medio' && preferencias.intensidad === 3) puntuacion += 15;
        if (producto.nivel_tostado === 'oscuro' && preferencias.intensidad >= 4) puntuacion += 15;
        
        // Bonus por calificación alta
        puntuacion += Math.round(producto.calificacion * 5);
        
        // Limitar a 100
        puntuacion = Math.min(puntuacion, 100);
        
        razon = `Basado en tu perfil de sabor: prefieres ${preferencias.nivelesTostadoPreferidos?.join(', ')} y sabores ${preferencias.saboresFavoritos?.join(', ')}. Este café tiene ${producto.notas_sabor?.join(', ')}.`;
      }
      
      return {
        producto: {
          id: producto.id,
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          precio: producto.precio,
          precioOriginal: producto.precio_original,
          descuento: producto.descuento,
          origen: producto.origen,
          region: producto.region,
          nivelTostado: producto.nivel_tostado,
          notasSabor: producto.notas_sabor || [],
          imagenUrl: producto.imagen_url || 'https://via.placeholder.com/400x300/92400e/ffffff?text=Café',
          categoria: producto.categoria,
          stock: producto.stock,
          peso: producto.peso,
          calificacion: producto.calificacion,
          cantidadReseñas: producto.cantidad_resenas,
          activo: producto.activo
        },
        puntuacion,
        razon,
        nivelConfianza: puntuacion / 100
      };
    }).sort((a, b) => b.puntuacion - a.puntuacion);
  }

  // Obtener última recomendación del usuario
  static async obtenerUltimaRecomendacion(idUsuario: string): Promise<RecomendacionIA | null> {
    const { data, error } = await supabase
      .from('recomendaciones_personalizadas')
      .select('*')
      .eq('usuario_id', idUsuario)
      .eq('activa', true)
      .order('fecha_generada', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No hay recomendaciones previas
      }
      throw new Error(`Error al obtener recomendación: ${error.message}`);
    }
    
    return data as RecomendacionIA;
  }

  // Obtener perfil de sabor del usuario
  static async obtenerPerfilSabor(idUsuario: string): Promise<PerfilSabor | null> {
    const { data, error } = await supabase
      .from('perfiles_sabor')
      .select('*')
      .eq('usuario_id', idUsuario)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No ha completado el cuestionario
      }
      throw new Error(`Error al obtener perfil de sabor: ${error.message}`);
    }
    
    return data as PerfilSabor;
  }

  // Obtener todas las recomendaciones del usuario
  static async obtenerHistorialRecomendaciones(idUsuario: string): Promise<RecomendacionIA[]> {
    const { data, error } = await supabase
      .from('recomendaciones_personalizadas')
      .select('*')
      .eq('usuario_id', idUsuario)
      .order('fecha_generada', { ascending: false });
    
    if (error) {
      throw new Error(`Error al obtener historial de recomendaciones: ${error.message}`);
    }
    
    return data as RecomendacionIA[];
  }

  // Marcar recomendación como inactiva
  static async desactivarRecomendacion(idUsuario: string, fechaGenerada: string): Promise<void> {
    const { error } = await supabase
      .from('recomendaciones_personalizadas')
      .update({ activa: false })
      .eq('usuario_id', idUsuario)
      .eq('fecha_generada', fechaGenerada);
    
    if (error) {
      throw new Error(`Error al desactivar recomendación: ${error.message}`);
    }
  }

  // Obtener estadísticas de recomendaciones
  static async obtenerEstadisticasRecomendaciones(): Promise<{
    totalRecomendaciones: number;
    usuariosConPerfil: number;
    promedioCalificacion: number;
  }> {
    const [
      { count: totalRecomendaciones, error: errorTotal },
      { count: usuariosConPerfil, error: errorUsuarios },
      { data: promedioData, error: errorPromedio }
    ] = await Promise.all([
      supabase.from('recomendaciones_personalizadas').select('*', { count: 'exact', head: true }),
      supabase.from('perfiles_sabor').select('*', { count: 'exact', head: true }),
      supabase.from('productos').select('calificacion').eq('activo', true)
    ]);
    
    if (errorTotal || errorUsuarios || errorPromedio) {
      throw new Error('Error al obtener estadísticas de recomendaciones');
    }
    
    const promedioCalificacion = promedioData && promedioData.length > 0 
      ? promedioData.reduce((sum, p) => sum + p.calificacion, 0) / promedioData.length 
      : 0;
    
    return {
      totalRecomendaciones: totalRecomendaciones || 0,
      usuariosConPerfil: usuariosConPerfil || 0,
      promedioCalificacion: Math.round(promedioCalificacion * 100) / 100
    };
  }
}
