import { useEffect, useState } from 'react';
import { authService } from '../services/authService';
import type { AuthUser } from '../types/auth.types';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  });

  useEffect(() => {
    // Usar el authService centralizado
    const updateAuthState = (user: AuthUser | null) => {
      if (user) {
        setAuthState({
          isAuthenticated: true,
          user: {
            id: user.id,
            name: user.email.split('@')[0], // Usar parte del email como nombre
            email: user.email
          },
          token: user.token
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          token: null
        });
      }
    };

    // Obtener usuario actual
    authService.getCurrentUser().then(updateAuthState);

    // Suscribirse a cambios de autenticación
    const unsubscribe = authService.onAuthStateChange(updateAuthState);

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    token: authState.token,
    authState
  };
} 