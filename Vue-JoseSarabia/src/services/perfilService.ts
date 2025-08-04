import { authService } from './authService';

// Configuración de Supabase
const supabaseUrl = 'https://aydbyfxeudluyscfjxqp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5ZGJ5ZnhldWRsdXlzY2ZqeHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NTY2NzAsImV4cCI6MjA2NzQzMjY3MH0.dH09IlJkCw5GuVeBan7JKXeQ-5mEV53CzfGTuKnazY8';

export interface PerfilUsuario {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  fecha_nacimiento?: string;
  direccion?: string;
  rol: 'admin' | 'cliente';
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface ConfiguracionUsuario {
  id: string;
  usuario_id: string;
  notificaciones: boolean;
  newsletter: boolean;
  dos_fa: boolean;
  tema_oscuro: boolean;
  idioma: string;
  creado_en: string;
  actualizado_en: string;
}

class PerfilService {
  async obtenerPerfil(): Promise<PerfilUsuario | null> {
    try {
      // Obtener usuario autenticado desde el shell
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        console.log('No hay usuario autenticado');
        return null;
      }

      // Usar fetch con el token JWT para obtener datos del perfil
      const response = await fetch(`${supabaseUrl}/rest/v1/usuarios?id=eq.${currentUser.id}&select=*`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'apikey': supabaseKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Error obteniendo perfil:', response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      if (data && data.length > 0) {
        return data[0] as PerfilUsuario;
      }

      return null;
    } catch (error) {
      console.error('Error en obtenerPerfil:', error);
      return null;
    }
  }

  async obtenerConfiguracion(): Promise<ConfiguracionUsuario | null> {
    try {
      // Obtener usuario autenticado desde el shell
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        console.log('No hay usuario autenticado');
        return null;
      }

      // Usar fetch con el token JWT para obtener configuración
      const response = await fetch(`${supabaseUrl}/rest/v1/configuraciones_usuario?usuario_id=eq.${currentUser.id}&select=*`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'apikey': supabaseKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Error obteniendo configuración:', response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      if (data && data.length > 0) {
        return data[0] as ConfiguracionUsuario;
      }

      return null;
    } catch (error) {
      console.error('Error en obtenerConfiguracion:', error);
      return null;
    }
  }

  async actualizarPerfil(datos: Partial<PerfilUsuario>): Promise<boolean> {
    try {
      // Obtener usuario autenticado desde el shell
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        console.log('No hay usuario autenticado');
        return false;
      }

      // Usar fetch con el token JWT para actualizar perfil
      const response = await fetch(`${supabaseUrl}/rest/v1/usuarios?id=eq.${currentUser.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'apikey': supabaseKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(datos)
      });

      if (!response.ok) {
        console.error('Error actualizando perfil:', response.status, response.statusText);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error en actualizarPerfil:', error);
      return false;
    }
  }

  async actualizarConfiguracion(datos: Partial<ConfiguracionUsuario>): Promise<boolean> {
    try {
      // Obtener usuario autenticado desde el shell
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        console.log('No hay usuario autenticado');
        return false;
      }

      // Usar fetch con el token JWT para actualizar configuración
      const response = await fetch(`${supabaseUrl}/rest/v1/configuraciones_usuario?usuario_id=eq.${currentUser.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'apikey': supabaseKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(datos)
      });

      if (!response.ok) {
        console.error('Error actualizando configuración:', response.status, response.statusText);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error en actualizarConfiguracion:', error);
      return false;
    }
  }
}

export const perfilService = new PerfilService(); 