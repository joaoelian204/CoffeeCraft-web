import type { Usuario, CrearUsuarioForm } from '../types/interfaces';
import { supabase } from '../supabase/supabaseClient';

class UsuarioService {
  async obtenerUsuarios(): Promise<Usuario[]> {
    const { data, error } = await supabase.from('usuarios').select('*');
    if (error) throw error;
    return (data || []) as Usuario[];
  }

  async obtenerUsuarioPorId(id: string): Promise<Usuario | null> {
    const { data, error } = await supabase.from('usuarios').select('*').eq('id', id).single();
    if (error) throw error;
    return data as Usuario;
  }

  async crearUsuario(datos: CrearUsuarioForm): Promise<Usuario> {
    const { data, error } = await supabase.from('usuarios').insert([{ ...datos, activo: true }]).select().single();
    if (error) throw error;
    return data as Usuario;
  }

  async actualizarUsuario(id: string, datos: Partial<Usuario>): Promise<Usuario | null> {
    const { data, error } = await supabase.from('usuarios').update(datos).eq('id', id).select().single();
    if (error) throw error;
    return data as Usuario;
  }

  async cambiarEstadoUsuario(id: string, activo: boolean): Promise<Usuario | null> {
    const { data, error } = await supabase.from('usuarios').update({ activo }).eq('id', id).select().single();
    if (error) throw error;
    return data as Usuario;
  }

  async eliminarUsuario(id: string): Promise<boolean> {
    const { error } = await supabase.from('usuarios').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
}

export const usuarioService = new UsuarioService();
