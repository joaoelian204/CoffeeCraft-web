// Sistema de Autenticación del Shell - Versión Mejorada
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.supabaseClient = null;
    this.init();
  }

  async init() {
    console.log('🔐 Inicializando AuthManager...');
    // Inicializar Supabase
    await this.initSupabase();
    // Restaurar sesión si existe en localStorage
    await this.restoreSessionFromLocalStorage();
    // Configurar listeners de autenticación
    this.setupAuthListeners();
    // Configurar event listeners del modal
    this.setupModalListeners();
    console.log('✅ AuthManager inicializado correctamente');
  }

  async restoreSessionFromLocalStorage() {
    try {
      const sessionData = localStorage.getItem('coffeecraft-shell-auth');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        if (session && session.access_token && session.user) {
          // Verificar si el token ha expirado
          if (session.expires_at) {
            const now = Math.floor(Date.now() / 1000);
            if (now >= session.expires_at) {
              console.warn('⚠️ Token expirado al restaurar sesión, intentando refrescar...');
              if (session.refresh_token) {
                const refreshed = await this.refreshToken(session.refresh_token);
                if (!refreshed) {
                  console.log('❌ No se pudo refrescar el token, limpiando sesión');
                  localStorage.removeItem('coffeecraft-shell-auth');
                  return;
                }
              } else {
                console.log('❌ No hay refresh token, limpiando sesión');
                localStorage.removeItem('coffeecraft-shell-auth');
                return;
              }
            }
          }
          
          this.currentUser = session.user;
          this.isAuthenticated = true;
          // Reestablecer sesión en Supabase (si es posible)
          if (this.supabaseClient && this.supabaseClient.auth && this.supabaseClient.auth.setSession) {
            await this.supabaseClient.auth.setSession({
              access_token: session.access_token,
              refresh_token: session.refresh_token
            });
            console.log('🔄 Sesión restaurada en Supabase desde localStorage');
            this.updateAuthUI();
            this.notifyMicrofrontends('AUTH_SIGNED_IN', { user: session.user });
          } else {
            this.updateAuthUI();
            this.notifyMicrofrontends('AUTH_SIGNED_IN', { user: session.user });
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Error restaurando sesión desde localStorage:', error);
    }
  }



  async initSupabase() {
    try {
      // Usar la versión UMD cargada globalmente
      if (typeof window.supabase !== 'undefined') {
        this.supabaseClient = window.supabase.createClient(
          'https://aydbyfxeudluyscfjxqp.supabase.co',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5ZGJ5ZnhldWRsdXlzY2ZqeHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NTY2NzAsImV4cCI6MjA2NzQzMjY3MH0.dH09IlJkCw5GuVeBan7JKXeQ-5mEV53CzfGTuKnazY8',
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false,
              detectSessionInUrl: false,
              storageKey: 'coffeecraft-shell-auth',
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
            }
          }
        );
        
        console.log('✅ Supabase inicializado en AuthManager');
        return this.supabaseClient;
      } else {
        throw new Error('Supabase no está disponible globalmente');
      }
    } catch (error) {
      console.error('❌ Error inicializando Supabase:', error);
      return null;
    }
  }

  setupAuthListeners() {
    if (!this.supabaseClient) {
      console.error('❌ No se puede configurar listeners: Supabase no está inicializado');
      return;
    }

    // Escuchar cambios de estado de autenticación
    this.supabaseClient.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Cambio de estado de autenticación:', event, session);
      
      if (event === 'SIGNED_IN' && session) {
        await this.handleSignIn(session.user);
      } else if (event === 'SIGNED_OUT') {
        this.handleSignOut();
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token refrescado');
      }
    });
  }

  async checkCurrentSession() {
    try {
      if (!this.supabaseClient) return;
      
      const { data: { user }, error } = await this.supabaseClient.auth.getUser();
      if (error) throw error;
      
      if (user) {
        console.log('✅ Sesión existente encontrada:', user.email);
        this.handleSignIn(user);
      } else {
        console.log('ℹ️ No hay sesión activa');
      }
    } catch (error) {
      console.log('ℹ️ No hay sesión activa:', error.message);
    }
  }

  async handleSignIn(user) {
    this.currentUser = user;
    this.isAuthenticated = true;
    
    console.log('✅ Usuario autenticado:', user.email);
    
    // Guardar sesión en localStorage para que Angular pueda acceder
    try {
      // Obtener la sesión actual usando la API correcta
      const { data: { session } } = await this.supabaseClient.auth.getSession();
      
      if (session) {
        const sessionData = {
          user: user,
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at
        };
        localStorage.setItem('coffeecraft-shell-auth', JSON.stringify(sessionData));
        console.log('💾 Sesión guardada en localStorage');
      } else {
        console.warn('⚠️ No se pudo obtener la sesión de Supabase');
      }
    } catch (error) {
      console.warn('⚠️ Error guardando sesión en localStorage:', error);
    }
    
    // Actualizar UI
    this.updateAuthUI();
    
    // Cerrar modal si está abierto
    this.hideAuthModal();
    
    // Notificar a los microfrontends
    this.notifyMicrofrontends('AUTH_SIGNED_IN', { user });
  }

  handleSignOut() {
    this.currentUser = null;
    this.isAuthenticated = false;
    
    console.log('🚪 Usuario desconectado');
    
    // Limpiar sesión de localStorage
    try {
      localStorage.removeItem('coffeecraft-shell-auth');
      console.log('🗑️ Sesión removida de localStorage');
    } catch (error) {
      console.warn('⚠️ Error removiendo sesión de localStorage:', error);
    }
    
    // Actualizar UI
    this.updateAuthUI();
    
    // Notificar a los microfrontends
    this.notifyMicrofrontends('AUTH_SIGNED_OUT', {});
  }

  updateAuthUI() {
    const authSection = document.getElementById('auth-section');
    const userMenu = document.getElementById('user-menu');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    const welcomeScreen = document.getElementById('welcome-screen');
    const dashboardContent = document.getElementById('dashboard-content');

    if (!authSection || !userMenu || !loginBtn || !registerBtn) {
      console.error('❌ Elementos de UI no encontrados');
      return;
    }

    if (this.isAuthenticated && this.currentUser) {
      // Usuario autenticado - mostrar dashboard y menú de usuario
      if (welcomeScreen) welcomeScreen.classList.add('hidden');
      if (dashboardContent) dashboardContent.classList.remove('hidden');
      
      authSection.classList.remove('hidden');
      userMenu.classList.remove('hidden');
      loginBtn.classList.add('hidden');
      registerBtn.classList.add('hidden');
      
      // Actualizar información del usuario
      const displayName = this.currentUser.user_metadata?.full_name || 
                         this.currentUser.user_metadata?.name ||
                         this.currentUser.email?.split('@')[0] ||
                         'Usuario';
      
      userName.textContent = displayName;
      userEmail.textContent = this.currentUser.email;
      
    } else {
      // Usuario no autenticado - mantener dashboard visible (temporal)
      if (welcomeScreen) welcomeScreen.classList.add('hidden');
      if (dashboardContent) dashboardContent.classList.remove('hidden');
      
      authSection.classList.remove('hidden');
      userMenu.classList.add('hidden');
      loginBtn.classList.remove('hidden');
      registerBtn.classList.remove('hidden');
      
      // Limpiar información del usuario
      if (userName) userName.textContent = 'Usuario';
      if (userEmail) userEmail.textContent = 'usuario@email.com';
    }
  }

  setupModalListeners() {
    // Botón para cerrar modal
    const closeBtn = document.getElementById('close-auth-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hideAuthModal());
    }

    // Cerrar modal al hacer clic en backdrop
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.hideAuthModal();
        }
      });
    }

    // Cambiar entre login y registro
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');
    
    if (switchToRegister) {
      switchToRegister.addEventListener('click', () => this.switchToRegister());
    }
    
    if (switchToLogin) {
      switchToLogin.addEventListener('click', () => this.switchToLogin());
    }

    // Formularios
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLoginSubmit(e));
    }
    
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => this.handleRegisterSubmit(e));
    }
  }

  showAuthModal(mode = 'login') {
    const modal = document.getElementById('auth-modal');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const title = document.getElementById('auth-title');
    const subtitle = document.getElementById('auth-subtitle');

    if (!modal) {
      console.error('❌ Modal no encontrado');
      return;
    }

    // Limpiar mensajes anteriores
    this.clearMessages();

    if (mode === 'register') {
      loginForm.classList.add('hidden');
      registerForm.classList.remove('hidden');
      title.textContent = 'Crear Cuenta';
      subtitle.textContent = 'Únete a CoffeCraft';
    } else {
      loginForm.classList.remove('hidden');
      registerForm.classList.add('hidden');
      title.textContent = 'Iniciar Sesión';
      subtitle.textContent = 'Accede a tu cuenta de CoffeCraft';
    }

    modal.classList.remove('hidden');
  }

  hideAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  switchToRegister() {
    this.showAuthModal('register');
  }

  switchToLogin() {
    this.showAuthModal('login');
  }

  async handleLoginSubmit(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
      this.showError('Por favor completa todos los campos');
      return;
    }

    this.showLoading('Iniciando sesión...');

    try {
      if (!this.supabaseClient) {
        throw new Error('Supabase no está inicializado');
      }

      const { data, error } = await this.supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      console.log('✅ Login exitoso:', data.user.email);
      this.showSuccess('¡Bienvenido de vuelta!');
      
      // El handleSignIn se ejecutará automáticamente por el listener
      
    } catch (error) {
      console.error('❌ Error en login:', error);
      this.showError(this.getErrorMessage(error));
    } finally {
      this.hideLoading();
    }
  }

  async handleRegisterSubmit(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('register-firstname').value;
    const lastName = document.getElementById('register-lastname').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      this.showError('Por favor completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      this.showError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      this.showError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    this.showLoading('Creando tu cuenta...');

    try {
      if (!this.supabaseClient) {
        throw new Error('Supabase no está inicializado');
      }

      console.log('🔄 Intentando registrar usuario:', { email, firstName, lastName });

      const { data, error } = await this.supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`
          }
        }
      });

      if (error) {
        console.error('❌ Error de Supabase en registro:', error);
        throw error;
      }

      console.log('✅ Registro exitoso:', data.user.email);
      this.showSuccess('¡Cuenta creada exitosamente! Revisa tu email para confirmar.');
      
      // Cambiar a formulario de login
      setTimeout(() => {
        this.switchToLogin();
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error en registro:', error);
      
      // Manejo específico de errores de base de datos
      if (error.message && error.message.includes('Database error saving new user')) {
        this.showError('Error en la base de datos. Por favor contacta al administrador o intenta más tarde.');
      } else {
        this.showError(this.getErrorMessage(error));
      }
    } finally {
      this.hideLoading();
    }
  }

  async handleLogout() {
    try {
      if (!this.supabaseClient) {
        throw new Error('Supabase no está inicializado');
      }

      const { error } = await this.supabaseClient.auth.signOut();
      if (error) throw error;

      console.log('✅ Logout exitoso');
      
      // El handleSignOut se ejecutará automáticamente por el listener
      
    } catch (error) {
      console.error('❌ Error en logout:', error);
      this.showError('Error al cerrar sesión');
    }
  }

  showLoading(text) {
    const loading = document.getElementById('auth-loading');
    const loadingText = document.getElementById('loading-text');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loading && loadingText) {
      loadingText.textContent = text;
      loading.classList.remove('hidden');
      if (loginForm) loginForm.classList.add('hidden');
      if (registerForm) registerForm.classList.add('hidden');
    }
  }

  hideLoading() {
    const loading = document.getElementById('auth-loading');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loading) {
      loading.classList.add('hidden');
    }
    
    // Mostrar el formulario apropiado
    const registerFormVisible = !registerForm.classList.contains('hidden');
    if (registerFormVisible) {
      registerForm.classList.remove('hidden');
    } else {
      loginForm.classList.remove('hidden');
    }
  }

  showMessage(text, type) {
    const message = document.getElementById('auth-message');
    const messageText = document.getElementById('auth-message-text');
    
    if (message && messageText) {
      messageText.textContent = text;
      message.className = `mt-4 p-4 rounded-lg ${type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
      message.classList.remove('hidden');
    }
  }

  showError(text) {
    this.showMessage(text, 'error');
  }

  showSuccess(text) {
    this.showMessage(text, 'success');
  }

  clearMessages() {
    const message = document.getElementById('auth-message');
    if (message) {
      message.classList.add('hidden');
    }
  }

  getErrorMessage(error) {
    if (error.message.includes('Invalid login credentials')) {
      return 'Credenciales incorrectas. Verifica tu email y contraseña.';
    } else if (error.message.includes('Email not confirmed')) {
      return 'Por favor confirma tu email antes de iniciar sesión.';
    } else if (error.message.includes('User already registered')) {
      return 'Este email ya está registrado.';
    } else if (error.message.includes('Password should be at least')) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    } else if (error.message.includes('Database error saving new user')) {
      return 'Error en la base de datos. El trigger de usuario no está funcionando correctamente.';
    } else if (error.message.includes('invalid claim: missing sub claim')) {
      return 'Error de autenticación. Por favor recarga la página e intenta de nuevo.';
    } else {
      return error.message || 'Ha ocurrido un error. Inténtalo de nuevo.';
    }
  }

  notifyMicrofrontends(type, data) {
    // Enviar mensaje a todos los iframes
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      try {
        iframe.contentWindow.postMessage({
          type,
          data,
          timestamp: Date.now()
        }, '*');
      } catch (error) {
        console.log('No se pudo enviar mensaje al iframe:', error);
      }
    });
  }

  // Responder a solicitudes de estado de autenticación
  handleAuthRequest(iframe) {
    try {
      const currentUser = this.getCurrentUser();
      iframe.contentWindow.postMessage({
        type: currentUser ? 'AUTH_SIGNED_IN' : 'AUTH_SIGNED_OUT',
        data: currentUser ? { user: currentUser } : {},
        timestamp: Date.now()
      }, '*');
      console.log('📤 Shell respondió solicitud de autenticación:', currentUser ? 'Usuario autenticado' : 'No autenticado');
    } catch (error) {
      console.log('Error respondiendo solicitud de autenticación:', error);
    }
  }

  // Métodos públicos para uso global
  getCurrentUser() {
    return this.currentUser;
  }

  isUserAuthenticated() {
    return this.isAuthenticated;
  }

  getAuthToken() {
    try {
      const sessionData = localStorage.getItem('coffeecraft-shell-auth');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        
        // Verificar si el token ha expirado
        if (session.expires_at) {
          const now = Math.floor(Date.now() / 1000);
          if (now >= session.expires_at) {
            console.warn('⚠️ Token expirado, intentando refrescar...');
            // Intentar refrescar el token
            this.refreshToken(session.refresh_token);
            return null;
          }
        }
        
        return session.access_token;
      }
    } catch (error) {
      console.warn('⚠️ Error obteniendo token de autenticación:', error);
    }
    return null;
  }

  async refreshToken(refreshToken) {
    try {
      if (!this.supabaseClient || !refreshToken) {
        console.warn('⚠️ No se puede refrescar el token: cliente o refresh token no disponible');
        return false;
      }

      const { data, error } = await this.supabaseClient.auth.refreshSession({
        refresh_token: refreshToken
      });

      if (error) {
        console.error('❌ Error refrescando token:', error);
        // Si no se puede refrescar, limpiar la sesión
        this.handleSignOut();
        return false;
      }

      if (data.session) {
        // Guardar la nueva sesión
        localStorage.setItem('coffeecraft-shell-auth', JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
          user: data.user
        }));
        
        this.currentUser = data.user;
        this.isAuthenticated = true;
        
        console.log('✅ Token refrescado exitosamente');
        return true;
      }
    } catch (error) {
      console.error('❌ Error en refreshToken:', error);
      this.handleSignOut();
      return false;
    }
    return false;
  }
}

// Exportar para uso global
window.AuthManager = AuthManager; 