import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  public isConfigured: boolean = false;

  constructor(private authService: AuthService) {
    // Use the centralized Supabase client from AuthService
    this.supabase = authService.supabase;
    console.log('🔧 SupabaseService usando cliente centralizado de AuthService');
    
    // Sincronizar sesión con el shell
    this.syncSessionWithShell();
  }

  private syncSessionWithShell() {
    // Escuchar cambios de autenticación del shell
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        console.log('🔄 Sincronizando sesión de Angular con Supabase para usuario:', user.id);
        // No intentar establecer sesión manualmente para evitar conflictos con NavigatorLockManager
      } else {
        console.log('🔄 Limpiando sesión de Angular en Supabase');
        // No hacer signOut automático para evitar conflictos
      }
    });
  }

  get client() {
    return this.supabase;
  }

  // Verificar si debemos usar datos mock
  get shouldUseMockData(): boolean {
    return false;
  }

  // Métodos de autenticación
  async signUp(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password
    });
    return { data, error };
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    return { error };
  }

  async getCurrentUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    return { user, error };
  }

  // Métodos genéricos de base de datos
  async select(table: string, columns: string = '*', conditions?: any) {
    let query = this.supabase.from(table).select(columns);
    
    if (conditions) {
      Object.keys(conditions).forEach(key => {
        query = query.eq(key, conditions[key]);
      });
    }
    
    const { data, error } = await query;
    return { data, error };
  }

  async insert(table: string, data: any) {
    const { data: result, error } = await this.supabase
      .from(table)
      .insert(data)
      .select();
    return { data: result, error };
  }

  async update(table: string, id: string, data: any) {
    const { data: result, error } = await this.supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select();
    return { data: result, error };
  }

  async delete(table: string, id: string) {
    const { data, error } = await this.supabase
      .from(table)
      .delete()
      .eq('id', id);
    return { data, error };
  }

  // Métodos específicos para planes de suscripción
  async getSubscriptionPlans() {
    return this.select('planes_suscripcion', '*', { activo: true });
  }

  async getSubscriptionPlan(id: string) {
    const { data, error } = await this.supabase
      .from('planes_suscripcion')
      .select('*')
      .eq('id_plan', id)
      .single();
    return { data, error };
  }

  // Métodos específicos para productos
  async getProducts() {
    return this.select('productos', '*');
  }

  async getProduct(id: string) {
    const { data, error } = await this.supabase
      .from('productos')
      .select('*')
      .eq('id_producto', id)
      .single();
    return { data, error };
  }

  // Métodos específicos para cupones
  async getCoupons() {
    return this.select('cupones', '*', { activo: true });
  }

  async getCoupon(code: string) {
    const { data, error } = await this.supabase
      .from('cupones')
      .select('*')
      .eq('codigo', code)
      .eq('activo', true)
      .single();
    return { data, error };
  }

  async updateCouponUsage(id: string, usados: number) {
    return this.update('cupones', id, { usados });
  }

  // Métodos específicos para regiones cafeteras
  async getCoffeeRegions() {
    return this.select('regiones_cafeteras', '*', { activa: true });
  }

  async getCoffeeRegion(id: string) {
    const { data, error } = await this.supabase
      .from('regiones_cafeteras')
      .select('*')
      .eq('id_region', id)
      .single();
    return { data, error };
  }

  // Métodos específicos para datos meteorológicos
  async getWeatherData(regionId: string) {
    const { data, error } = await this.supabase
      .from('datos_clima')
      .select('*')
      .eq('id_region', regionId)
      .single();
    return { data, error };
  }

  async getLatestWeatherForAllRegions() {
    const { data, error } = await this.supabase
      .from('weather_data')
      .select(`
        *,
        coffee_regions (
          id,
          name,
          country,
          latitude,
          longitude,
          elevation,
          description,
          coffee_varieties,
          harvest_start,
          harvest_end,
          image_url
        )
      `)
      .order('timestamp', { ascending: false });
    return { data, error };
  }

  // Métodos para órdenes
  async createOrder(orderData: any) {
    return this.insert('orders', orderData);
  }

  async getUserOrders(userId: string) {
    return this.select('orders', '*', { user_id: userId });
  }

  async updateOrderStatus(orderId: string, status: string) {
    return this.update('orders', orderId, { status });
  }

  // Métodos específicos para items_carrito
  async updateItemCarrito(id_carrito: string, id_producto: string, data: any) {
    const { data: result, error } = await this.supabase
      .from('items_carrito')
      .update(data)
      .eq('id_carrito', id_carrito)
      .eq('id_producto', id_producto)
      .select();
    return { data: result, error };
  }

  async deleteItemCarrito(id_carrito: string, id_producto: string) {
    const { data, error } = await this.supabase
      .from('items_carrito')
      .delete()
      .eq('id_carrito', id_carrito)
      .eq('id_producto', id_producto);
    return { data, error };
  }

  async deleteItemsCarritoPorCarrito(id_carrito: string) {
    const { data, error } = await this.supabase
      .from('items_carrito')
      .delete()
      .eq('id_carrito', id_carrito);
    return { data, error };
  }
}