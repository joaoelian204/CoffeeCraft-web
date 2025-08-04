// Servicio de autenticación para Vue - Comunica con el shell
class AuthService {
  // Obtener token de autenticación del shell
  async getAuthToken(): Promise<string | null> {
    return new Promise((resolve) => {
      if (window.parent && window.parent !== window) {
        console.log('🔑 Vue solicitando token de autenticación al shell...');
        window.parent.postMessage({ type: 'REQUEST_AUTH_TOKEN' }, '*');
        
        const handleMessage = (event: MessageEvent) => {
          if (event.data.type === 'AUTH_TOKEN_RESPONSE') {
            window.removeEventListener('message', handleMessage);
            console.log('🔑 Vue recibió respuesta de token:', !!event.data.token);
            resolve(event.data.token);
          }
        };
        
        window.addEventListener('message', handleMessage);
        
        // Timeout después de 5 segundos
        setTimeout(() => {
          window.removeEventListener('message', handleMessage);
          console.log('⚠️ Timeout esperando token de autenticación');
          resolve(null);
        }, 5000);
      } else {
        console.log('⚠️ No se puede comunicar con el shell');
        resolve(null);
      }
    });
  }

  // Extraer userId del token JWT
  getUserIdFromToken(token: string): string | null {
    try {
      const tokenParts = token.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      return payload.sub;
    } catch (error) {
      console.error('Error extrayendo userId del token:', error);
      return null;
    }
  }

  // Verificar si el usuario está autenticado
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAuthToken();
    return !!token;
  }

  // Obtener información del usuario autenticado
  async getCurrentUser(): Promise<{ id: string; token: string } | null> {
    const token = await this.getAuthToken();
    if (!token) {
      return null;
    }

    const userId = this.getUserIdFromToken(token);
    if (!userId) {
      return null;
    }

    return { id: userId, token };
  }
}

export const authService = new AuthService(); 