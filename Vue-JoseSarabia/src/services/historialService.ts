import type { Historial } from '../types/interfaces';
import { supabase } from '../supabase/supabaseClient';
import { authService } from './authService';

class HistorialService {
  async obtenerHistorial(): Promise<Historial[]> {
    // Primero obtener historial básico sin JOIN
    const { data: historialData, error: historialError } = await supabase
      .from('historial')
      .select(`
        *,
        historial_items (
          id,
          cafe_id,
          nombre,
          cantidad,
          subtotal
        )
      `)
      .order('created_at', { ascending: false });
    
    if (historialError) {
      console.error('Error obteniendo historial:', historialError);
      throw historialError;
    }
    
    // Obtener usuarios por separado
    const { data: usuariosData, error: usuariosError } = await supabase
      .from('usuarios')
      .select('id, nombre, email');
    
    if (usuariosError) {
      console.error('Error obteniendo usuarios:', usuariosError);
    }
    
    // Transformar los datos
    return (historialData || []).map(compra => {
      const usuario = usuariosData?.find(u => u.id === compra.usuario_id);
      
      return {
        id: compra.id,
        usuarioId: compra.usuario_id,
        usuarioNombre: usuario?.nombre || 'Usuario no encontrado',
        usuarioEmail: usuario?.email || '',
        fecha: compra.fecha,
        subtotal: compra.subtotal,
        iva: compra.iva,
        total: compra.total,
        items: compra.historial_items.map((item: any) => ({
          cafeId: item.cafe_id,
          nombre: item.nombre,
          cantidad: item.cantidad,
          subtotal: item.subtotal
        }))
      };
    });
  }

  async obtenerHistorialPorUsuario(): Promise<Historial[]> {
    try {
      console.log('🔄 Iniciando obtención de historial por usuario...');
      
      // Obtener usuario autenticado del shell
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        console.log('❌ No hay usuario autenticado');
        return [];
      }

      console.log('✅ Usuario autenticado:', currentUser.id);

      // Configurar headers con el token del shell
      const headers = {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5ZGJ5ZnhldWRsdXlzY2ZqeHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NTY2NzAsImV4cCI6MjA2NzQzMjY3MH0.dH09IlJkCw5GuVeBan7JKXeQ-5mEV53CzfGTuKnazY8',
        'Authorization': `Bearer ${currentUser.token}`
      };

      // Obtener pedidos del usuario usando fetch con el token del shell
      const url = `https://aydbyfxeudluyscfjxqp.supabase.co/rest/v1/pedidos?usuario_id=eq.${currentUser.id}&select=*,items_pedido(*),estados_pedido(nombre,color)&order=fecha_pedido.desc`;
      console.log('🌐 Haciendo petición a:', url);
      
      const response = await fetch(url, { headers });

      console.log('📥 Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        console.error('❌ Error obteniendo pedidos:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('❌ Detalles del error:', errorText);
        return [];
      }

      const pedidosData = await response.json();
      console.log('✅ Pedidos obtenidos:', pedidosData);
      
      // Transformar pedidos a formato de historial
      return (pedidosData || []).map((pedido: any) => ({
        id: pedido.id,
        usuarioId: pedido.usuario_id,
        fecha: pedido.fecha_pedido,
        subtotal: pedido.subtotal,
        iva: pedido.iva,
        total: pedido.total,
        numeroPedido: pedido.numero_pedido,
        estado: pedido.estados_pedido?.nombre || 'Pendiente',
        items: pedido.items_pedido.map((item: any) => ({
          cafeId: item.producto_id,
          nombre: item.nombre,
          cantidad: item.cantidad,
          subtotal: item.subtotal
        }))
      }));
    } catch (error) {
      console.error('Error en obtenerHistorialPorUsuario:', error);
      return [];
    }
  }

  async crearHistorial(historial: Omit<Historial, 'id'>): Promise<Historial> {
    // Primero crear el registro principal
    const historialParaDB = {
      usuario_id: historial.usuarioId,
      fecha: historial.fecha,
      subtotal: historial.subtotal,
      iva: historial.iva,
      total: historial.total
    };
    
    const { data: historialData, error: historialError } = await supabase
      .from('historial')
      .insert([historialParaDB])
      .select()
      .single();

    if (historialError) {
      console.error('Error insertando historial:', historialError);
      throw historialError;
    }

    // Luego crear los items
    if (historial.items.length > 0) {
      const itemsData = historial.items.map(item => ({
        historial_id: historialData.id,
        cafe_id: item.cafeId,
        nombre: item.nombre,
        cantidad: item.cantidad,
        subtotal: item.subtotal
      }));

      const { error: itemsError } = await supabase
        .from('historial_items')
        .insert(itemsData);

      if (itemsError) {
        console.error('Error insertando items:', itemsError);
        throw itemsError;
      }
    }

    // Retornar un objeto simplificado
    return {
      id: historialData.id,
      usuarioId: historial.usuarioId,
      fecha: historial.fecha,
      subtotal: historial.subtotal,
      iva: historial.iva,
      total: historial.total,
      items: historial.items
    };
  }

  async eliminarHistorial(id: string): Promise<boolean> {
    // Primero eliminar los items del historial
    const { error: itemsError } = await supabase
      .from('historial_items')
      .delete()
      .eq('historial_id', id);

    if (itemsError) {
      console.error('Error eliminando items:', itemsError);
      throw itemsError;
    }

    // Luego eliminar el historial principal
    const { error: historialError } = await supabase
      .from('historial')
      .delete()
      .eq('id', id);

    if (historialError) {
      console.error('Error eliminando historial:', historialError);
      throw historialError;
    }

    return true;
  }
}

export const historialService = new HistorialService();
