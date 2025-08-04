// Servicio de autenticación para React que se comunica con el shell
import type { AuthUser } from '../types/auth.types';

class AuthService {
  private currentUser: AuthUser | null = null;
  private listeners: ((user: AuthUser | null) => void)[] = [];

  constructor() {
    console.log('🔧 React: AuthService constructor llamado');
    this.setupMessageListener();
    console.log('🔧 React: AuthService inicializado correctamente');
  }

  private setupMessageListener() {
    console.log('🔧 React: Configurando listener de mensajes...');
    console.log('🔧 React: Agregando event listener para mensajes...');
    window.addEventListener('message', (event) => {
      console.log('📨 React recibió mensaje en setupMessageListener:', event.data?.type, 'desde:', event.origin);
      console.log('🔍 React: Mensaje completo:', event.data);
      console.log('🔍 React: event.origin:', event.origin);
      console.log('🔍 React: event.data?.type:', event.data?.type);
      console.log('🔍 React: event.data?.source:', event.data?.source);
      
      if (event.origin !== 'http://localhost:9000') {
        console.log('❌ React: Origen no permitido en setupMessageListener:', event.origin);
        return;
      }

      if (event.data.type === 'AUTH_SIGNED_IN') {
        console.log('🔐 React recibió: Usuario autenticado', event.data.data.user);
        const userWithToken = {
          ...event.data.data.user,
          token: event.data.data.token
        };
        this.setCurrentUser(userWithToken);
      } else if (event.data.type === 'AUTH_SIGNED_OUT') {
        console.log('🚪 React recibió: Usuario desconectado');
        this.setCurrentUser(null);
      }
    });

    // Solicitar estado actual de autenticación al shell
    this.requestAuthState();
  }

  private setCurrentUser(user: AuthUser | null) {
    this.currentUser = user;
    this.listeners.forEach(listener => listener(user));
  }

  private requestAuthState() {
    console.log('🔍 React solicitó estado de autenticación al shell');
    console.log('📤 React enviando REQUEST_AUTH_STATE:', {
      type: 'REQUEST_AUTH_STATE',
      source: 'react'
    });
    console.log('🔧 React: window.parent disponible:', !!window.parent);
    console.log('🔧 React: window.parent.postMessage disponible:', !!window.parent.postMessage);
    
    try {
      window.parent.postMessage({
        type: 'REQUEST_AUTH_STATE',
        source: 'react'
      }, 'http://localhost:9000');
      console.log('✅ React: REQUEST_AUTH_STATE enviado exitosamente');
    } catch (error) {
      console.error('❌ React: Error enviando REQUEST_AUTH_STATE:', error);
    }
  }

  public async getCurrentUser(): Promise<AuthUser | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    // Si no hay usuario, solicitar al shell
    return this.requestTokenFromShell();
  }

  private async requestTokenFromShell(): Promise<AuthUser | null> {
    return new Promise((resolve) => {
      console.log('🔑 React solicitando token de autenticación al shell...');
      
      const handleMessage = (event: MessageEvent) => {
        console.log('📨 React recibió mensaje en handleMessage:', event.data?.type, 'desde:', event.origin, 'source:', event.data?.source);
        console.log('🔍 React: handleMessage - event.origin:', event.origin);
        console.log('🔍 React: handleMessage - event.data?.type:', event.data?.type);
        console.log('🔍 React: handleMessage - event.data?.source:', event.data?.source);
        console.log('🔍 React: handleMessage - event.data completo:', event.data);
        
        if (event.origin !== 'http://localhost:9000') {
          console.log('❌ React: Origen no permitido en handleMessage:', event.origin);
          return;
        }
        
        if (event.data.type === 'AUTH_TOKEN_RESPONSE' && event.data.source === 'react') {
          window.removeEventListener('message', handleMessage);
          console.log('🔍 AUTH_TOKEN_RESPONSE recibido:', event.data);
          console.log('🔍 event.data.data:', event.data.data);
          console.log('🔍 event.data.data.user:', event.data.data?.user);
          console.log('🔍 event.data.data.token:', event.data.data?.token);
          console.log('🔍 event.data.data.token type:', typeof event.data.data?.token);
          console.log('🔍 event.data.data.token length:', event.data.data?.token?.length);
          
          if (event.data.data && event.data.data.user) {
            const userWithToken = {
              ...event.data.data.user,
              token: event.data.data.token
            };
            this.setCurrentUser(userWithToken);
            console.log('🔑 React recibió token del shell:', !!userWithToken.token);
            console.log('🔍 Token recibido:', userWithToken.token);
            console.log('🔍 Token length:', userWithToken.token?.length);
            console.log('🔍 Token parts:', userWithToken.token?.split('.').length);
            resolve(userWithToken);
          } else {
            console.log('❌ React no recibió token del shell');
            resolve(null);
          }
        }
      };

             console.log('🔧 React: Agregando event listener para handleMessage...');
       window.addEventListener('message', handleMessage);
       console.log('🔧 React: Event listener agregado para handleMessage');

      // Enviar solicitud al shell
      console.log('📤 React enviando mensaje al shell:', {
        type: 'REQUEST_AUTH_TOKEN',
        source: 'react'
      });
      
             try {
         console.log('🔧 React: Enviando REQUEST_AUTH_TOKEN al shell...');
         window.parent.postMessage({
           type: 'REQUEST_AUTH_TOKEN',
           source: 'react'
         }, 'http://localhost:9000');
         console.log('✅ React: REQUEST_AUTH_TOKEN enviado exitosamente');
       } catch (error) {
         console.error('❌ React: Error enviando REQUEST_AUTH_TOKEN:', error);
       }

             // Timeout después de 5 segundos
       setTimeout(() => {
         console.log('⏰ React: Timeout alcanzado, removiendo event listener...');
         window.removeEventListener('message', handleMessage);
         console.log('⚠️ React: Timeout esperando token de autenticación');
         resolve(null);
       }, 5000);
    });
  }

  public onAuthStateChange(listener: (user: AuthUser | null) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public getCurrentUserSync(): AuthUser | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }
}

export const authService = new AuthService(); 