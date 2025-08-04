import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environments';

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    last_name?: string;
  };
  token?: string; // Add token for direct API calls
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // Centralized Supabase client instance
  private supabaseClient: SupabaseClient;

  constructor() {
    // Create the single Supabase client instance
    this.supabaseClient = createClient(
      environment.supabase.url,
      environment.supabase.anonKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
          storageKey: 'coffeecraft-auth-token',
          storage: {
            getItem: (key) => {
              try {
                return localStorage.getItem(key);
              } catch (error) {
                console.warn('Error accediendo a localStorage:', error);
                return null;
              }
            },
            setItem: (key, value) => {
              try {
                localStorage.setItem(key, value);
              } catch (error) {
                console.warn('Error guardando en localStorage:', error);
              }
            },
            removeItem: (key) => {
              try {
                localStorage.removeItem(key);
              } catch (error) {
                console.warn('Error removiendo de localStorage:', error);
              }
            }
          }
        },
        global: {
          headers: {
            'X-Client-Info': 'coffeecraft-angular'
          }
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      }
    );
    
    console.log('🔧 Supabase client centralizado creado en AuthService');
    this.initAuthListener();
  }

  // Getter for the centralized Supabase client
  get supabase(): SupabaseClient {
    return this.supabaseClient;
  }

  private initAuthListener() {
    // Escuchar mensajes del shell sobre cambios de autenticación
    window.addEventListener('message', (event) => {
      if (event.origin !== 'http://localhost:9000') return;

      if (event.data.type === 'AUTH_SIGNED_IN') {
        console.log('🔐 Angular recibió: Usuario autenticado', event.data.data.user);
        // Add token to user data
        const userWithToken = {
          ...event.data.data.user,
          token: event.data.data.token
        };
        this.setCurrentUser(userWithToken);
        
        // Sincronizar la sesión de Supabase con el token del shell
        this.syncSupabaseSession(event.data.data.token, event.data.data.user);
      } else if (event.data.type === 'AUTH_SIGNED_OUT') {
        console.log('🚪 Angular recibió: Usuario desconectado');
        this.setCurrentUser(null);
        
        // Limpiar sesión de Supabase
        this.clearSupabaseSession();
      }
    });

    // Solicitar estado actual de autenticación al shell
    this.requestAuthState();
  }

  // Sincronizar la sesión de Supabase con el token del shell
  public async syncSupabaseSession(token: string, user: any) {
    try {
      console.log('🔄 Sincronizando sesión de Supabase con token del shell...');
      
      // Verificar si ya hay una sesión activa
      const { data: { session: currentSession } } = await this.supabaseClient.auth.getSession();
      
      if (currentSession?.access_token === token) {
        console.log('✅ Sesión ya está sincronizada');
        return;
      }
      
      // Intentar establecer la sesión usando el método más directo
      try {
        const { data, error } = await this.supabaseClient.auth.setSession({
          access_token: token,
          refresh_token: '', // No tenemos refresh token del shell
        });
        
        if (error) {
          console.warn('⚠️ Error con setSession, intentando método alternativo:', error);
          await this.fallbackSessionSync(token, user);
        } else {
          console.log('✅ Sesión de Supabase sincronizada correctamente');
          return;
        }
      } catch (setSessionError) {
        console.warn('⚠️ Error con setSession, intentando método alternativo:', setSessionError);
        await this.fallbackSessionSync(token, user);
      }
    } catch (error) {
      console.warn('⚠️ Error en syncSupabaseSession:', error);
      // Intentar método alternativo
      await this.fallbackSessionSync(token, user);
    }
  }

  private async fallbackSessionSync(token: string, user: any) {
    try {
      console.log('🔄 Intentando método alternativo de sincronización...');
      
      // Crear una sesión manual con el token
      const session = {
        access_token: token,
        refresh_token: '',
        expires_in: 3600,
        token_type: 'bearer',
        user: user
      };
      
      // Establecer la sesión manualmente
      await this.supabaseClient.auth.setSession(session);
      console.log('✅ Sincronización alternativa completada');
    } catch (fallbackError) {
      console.warn('⚠️ Error en fallbackSessionSync:', fallbackError);
    }
  }

  // Limpiar sesión de Supabase
  private async clearSupabaseSession() {
    try {
      console.log('🧹 Limpiando sesión de Supabase...');
      await this.supabaseClient.auth.signOut();
      console.log('✅ Sesión de Supabase limpiada');
    } catch (error) {
      console.warn('⚠️ Error limpiando sesión de Supabase:', error);
    }
  }

  private requestAuthState() {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'AUTH_REQUEST'
        }, 'http://localhost:9000');
        console.log('🔍 Angular solicitó estado de autenticación al shell');
      }
    } catch (error) {
      console.log('⚠️ No se pudo solicitar estado de autenticación:', error);
    }
  }

  private setCurrentUser(user: AuthUser | null) {
    this.currentUserSubject.next(user);
    
    if (user) {
      console.log('✅ Usuario establecido en Angular:', user.id);
      // Guardar en localStorage para persistencia con manejo de errores mejorado
      this.safeLocalStorageSet('coffeecraft-user', JSON.stringify(user));
    } else {
      console.log('❌ Usuario limpiado en Angular');
      this.safeLocalStorageRemove('coffeecraft-user');
    }
  }

  private safeLocalStorageSet(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('Error guardando en localStorage (puede ser NavigatorLockManager):', error);
      // Intentar limpiar y volver a intentar
      try {
        localStorage.clear();
        localStorage.setItem(key, value);
      } catch (retryError) {
        console.error('Error persistente en localStorage:', retryError);
      }
    }
  }

  private safeLocalStorageRemove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Error removiendo de localStorage (puede ser NavigatorLockManager):', error);
    }
  }

  // Obtener usuario actual
  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  // Obtener ID del usuario actual
  getCurrentUserId(): string | null {
    const user = this.getCurrentUser();
    return user?.id || null;
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  // Obtener nombre del usuario
  getUserDisplayName(): string {
    const user = this.getCurrentUser();
    if (!user) return 'Usuario';

    return user.user_metadata?.full_name || 
           user.user_metadata?.name || 
           user.email?.split('@')[0] || 
           'Usuario';
  }

  // Cargar usuario desde localStorage (para persistencia)
  loadUserFromStorage() {
    try {
      const storedUser = localStorage.getItem('coffeecraft-user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        this.setCurrentUser(user);
        console.log('📦 Usuario cargado desde localStorage:', user.id);
        
        // Sincronizar sesión de Supabase si tenemos token
        if (user.token) {
          this.syncSupabaseSession(user.token, user);
        }
      }
    } catch (error) {
      console.warn('Error cargando usuario desde localStorage (puede ser NavigatorLockManager):', error);
      // Limpiar localStorage corrupto
      this.safeLocalStorageRemove('coffeecraft-user');
    }
  }

  // Limpiar usuario (logout)
  clearUser() {
    this.setCurrentUser(null);
  }

  // Método para obtener el token JWT actual
  async getCurrentUserToken(): Promise<string | null> {
    const user = this.getCurrentUser();
    if (user?.token) {
      console.log('🔑 Token obtenido desde usuario actual:', user.token.substring(0, 20) + '...');
      return user.token;
    }
    
    // Fallback: try to get token from Supabase client
    try {
      const { data: { session } } = await this.supabaseClient.auth.getSession();
      if (session?.access_token) {
        console.log('🔑 Token obtenido desde Supabase client:', session.access_token.substring(0, 20) + '...');
        return session.access_token;
      }
    } catch (error) {
      console.warn('Error obteniendo token de Supabase:', error);
    }
    
    // Último intento: solicitar token al shell
    try {
      console.log('🔄 Solicitando token al shell...');
      const token = await this.requestTokenFromShell();
      if (token) {
        console.log('🔑 Token obtenido desde shell:', token.substring(0, 20) + '...');
        return token;
      }
    } catch (error) {
      console.warn('Error solicitando token al shell:', error);
    }
    
    console.warn('⚠️ No se pudo obtener token de autenticación');
    return null;
  }

  private requestTokenFromShell(): Promise<string | null> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.warn('⚠️ Timeout esperando token de autenticación');
        resolve(null);
      }, 5000);

      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== 'http://localhost:9000') return;
        
        if (event.data.type === 'AUTH_TOKEN_RESPONSE') {
          clearTimeout(timeout);
          window.removeEventListener('message', handleMessage);
          resolve(event.data.token || null);
        }
      };

      window.addEventListener('message', handleMessage);
      
      // Solicitar token al shell
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'REQUEST_AUTH_TOKEN'
        }, 'http://localhost:9000');
      }
    });
  }
} 