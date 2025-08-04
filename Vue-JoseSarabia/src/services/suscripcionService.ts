import { authService } from './authService';

// Configuración de Supabase
const supabaseUrl = 'https://aydbyfxeudluyscfjxqp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5ZGJ5ZnhldWRsdXlzY2ZqeHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NTY2NzAsImV4cCI6MjA2NzQzMjY3MH0.dH09IlJkCw5GuVeBan7JKXeQ-5mEV53CzfGTuKnazY8';

export interface PlanSuscripcion {
  id: string;
  nombre: string;
  descripcion: string;
  precio_mensual: number;
  cantidad_cafe: number;
  frecuencia_entrega: string;
  beneficios: string[];
  activo: boolean;
  popular?: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface SuscripcionUsuario {
  id: string;
  usuario_id: string;
  plan_id: string;
  plan?: PlanSuscripcion;
  estado: 'activa' | 'pausada' | 'cancelada' | 'expirada';
  personalizaciones?: {
    nivel_tostado?: string;
    tipo_molido?: string;
    cantidad?: string;
    preferencias?: string[];
  };
  direccion_entrega?: any;
  metodo_pago?: any;
  fecha_inicio: string;
  fecha_proxima_entrega: string;
  fecha_fin?: string;
  creado_en: string;
  actualizado_en: string;
}

class SuscripcionService {
  async obtenerSuscripcionActual(): Promise<SuscripcionUsuario | null> {
    try {
      console.log('🔄 Obteniendo suscripción actual...');
      
      // Obtener usuario autenticado desde el shell
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        console.log('❌ No hay usuario autenticado');
        return null;
      }

      console.log('👤 Usuario autenticado:', currentUser.id);

      // Usar fetch con el token JWT para obtener la suscripción más reciente
      const response = await fetch(`${supabaseUrl}/rest/v1/suscripciones_usuarios?usuario_id=eq.${currentUser.id}&select=*&order=creado_en.desc&limit=1`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'apikey': supabaseKey,
          'Content-Type': 'application/json'
        }
      });

      console.log('📋 Respuesta del servidor:', response.status, response.statusText);

      if (!response.ok) {
        console.error('❌ Error obteniendo suscripción:', response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      console.log('📋 Datos de suscripción recibidos:', data);
      
      if (data && data.length > 0) {
        const suscripcion = data[0] as SuscripcionUsuario;
        console.log('✅ Suscripción encontrada:', suscripcion.id, suscripcion.estado);
        
        // Obtener los datos completos del plan
        if (suscripcion.plan_id) {
          console.log('📋 Obteniendo datos del plan:', suscripcion.plan_id);
          const planData = await this.obtenerPlanPorId(suscripcion.plan_id, currentUser.token);
          if (planData) {
            suscripcion.plan = planData;
            console.log('✅ Plan obtenido:', planData.nombre);
          }
        }
        
        return suscripcion;
      }

      console.log('⚠️ No se encontraron suscripciones para el usuario');
      return null;
    } catch (error) {
      console.error('❌ Error en obtenerSuscripcionActual:', error);
      return null;
    }
  }

  async obtenerPlanPorId(planId: string, token: string): Promise<PlanSuscripcion | null> {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/planes_suscripcion?id=eq.${planId}&select=*`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': supabaseKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Error obteniendo plan:', response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      if (data && data.length > 0) {
        const plan = data[0];
        return {
          ...plan,
          beneficios: Array.isArray(plan.beneficios) ? plan.beneficios : [],
          popular: plan.nombre === 'Premium',
          creado_en: plan.creado_en,
          actualizado_en: plan.actualizado_en,
        } as PlanSuscripcion;
      }

      return null;
    } catch (error) {
      console.error('Error en obtenerPlanPorId:', error);
      return null;
    }
  }

  async obtenerEstadisticasSuscripcion(): Promise<any> {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        return null;
      }

      const response = await fetch(`${supabaseUrl}/rest/v1/suscripciones_usuarios?usuario_id=eq.${currentUser.id}&select=*`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'apikey': supabaseKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      if (!Array.isArray(data)) return null;
      
      const suscripciones = data;
      const activas = suscripciones.filter(s => s.estado === 'activa').length;
      const pausadas = suscripciones.filter(s => s.estado === 'pausada').length;
      const canceladas = suscripciones.filter(s => s.estado === 'cancelada').length;
      
      return {
        total: suscripciones.length,
        activas,
        pausadas,
        canceladas,
        ultima_suscripcion: suscripciones.length > 0 ? suscripciones[suscripciones.length - 1] : null
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return null;
    }
  }

  // Método para refrescar la suscripción (útil después de cambios)
  async refrescarSuscripcion(): Promise<SuscripcionUsuario | null> {
    console.log('🔄 Refrescando suscripción...');
    return await this.obtenerSuscripcionActual();
  }
}

export const suscripcionService = new SuscripcionService(); 