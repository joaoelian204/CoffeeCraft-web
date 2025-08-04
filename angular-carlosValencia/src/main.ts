import { bootstrapApplication } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { AuthService } from './app/services/auth.service';

// Función para inicializar la aplicación Angular
export async function initAngularApp(container: HTMLElement) {
  // Configurar el contenedor
  container.innerHTML = '<app-root></app-root>';
  
  // Bootstrap de la aplicación
  const app = await bootstrapApplication(AppComponent, appConfig);
  
  return app;
}

// Solo bootstrap si no estamos en modo microfrontend
if (!window.location.search.includes('microfrontend=true')) {
  bootstrapApplication(AppComponent, appConfig)
    .catch((err) => console.error(err));
} else {
  // En modo microfrontend, ocultar barras de navegación y inicializar
  const style = document.createElement('style');
  style.textContent = `
    /* Ocultar header y footer de Angular en modo microfrontend */
    header, footer {
      display: none !important;
    }
    
    /* Ocultar cualquier barra de navegación en modo microfrontend */
    nav, .navbar, .navigation, [class*="nav"] {
      display: none !important;
    }
    
    /* Asegurar que el contenido use toda la altura disponible SIN scroll */
    body, html {
      margin: 0 !important;
      padding: 0 !important;
      height: auto !important;
      overflow: visible !important;
      width: 100% !important;
    }
    
    /* Ocultar scrollbars completamente */
    ::-webkit-scrollbar {
      display: none !important;
      width: 0 !important;
    }
    
    /* Asegurar que el contenido principal use toda la altura disponible */
    app-root {
      display: block !important;
      height: auto !important;
      width: 100% !important;
      overflow: visible !important;
    }
    
    /* Hacer que todos los componentes se adapten al viewport */
    * {
      box-sizing: border-box !important;
    }
    
    /* Asegurar que las páginas usen toda la altura disponible */
    .page-container, .component-container {
      height: auto !important;
      width: 100% !important;
      overflow: visible !important;
      display: flex !important;
      flex-direction: column !important;
    }
    
    /* Asegurar que el contenido se adapte */
    .content-area {
      flex: 1 !important;
      overflow: visible !important;
    }
    
    /* Asegurar que los componentes de Angular se adapten al iframe */
    .min-h-screen {
      min-height: auto !important;
      height: auto !important;
      overflow: visible !important;
    }
    
    /* Asegurar que el contenido principal se adapte */
    main {
      height: auto !important;
      overflow: visible !important;
    }
    
    /* En modo microfrontend, el contenido principal debe ocupar toda la altura */
    .h-screen {
      height: auto !important;
    }
    
    /* El contenido principal debe ocupar todo el espacio disponible */
    .flex-1 {
      flex: 1 !important;
    }
  `;
  document.head.appendChild(style);
  
  // Inicializar la aplicación
  bootstrapApplication(AppComponent, appConfig)
    .then(app => {
      console.log('🚀 Aplicación Angular inicializada');
      
      // Inicializar servicio de autenticación
      const authService = app.injector.get(AuthService);
      authService.loadUserFromStorage(); // Cargar usuario desde localStorage si existe
      
      // Escuchar mensajes del shell
      window.addEventListener('message', (event) => {
        if (event.origin !== 'http://localhost:9000') return;
        
        if (event.data.type === 'NAVIGATE') {
          console.log('🔄 Recibido mensaje de navegación:', event.data.route);
          const router = app.injector.get(Router);
          
          // Mapear las rutas del shell a las rutas de Angular
          let angularRoute = event.data.route;
          if (event.data.route === 'carrito') {
            angularRoute = 'carrito';
          } else if (event.data.route === 'suscripciones') {
            angularRoute = 'suscripciones';
          } else if (event.data.route === 'clima') {
            angularRoute = 'clima';
          }
          
          router.navigate([angularRoute]).then(() => {
            console.log('✅ Navegación completada a:', angularRoute);
          }).catch((error) => {
            console.error('❌ Error en navegación:', error);
          });
        }
      });
      
      // Notificar al shell que Angular está listo
      setTimeout(() => {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({
            type: 'ANGULAR_READY',
            ready: true
          }, 'http://localhost:9000');
        }
      }, 500);

      // Función para enviar altura al shell
      function sendHeightToShell() {
        if (window.parent && window.parent !== window) {
          const height = document.documentElement.scrollHeight;
          window.parent.postMessage({
            type: 'ANGULAR_HEIGHT',
            height: height
          }, 'http://localhost:9000');
          console.log('📏 Enviando altura al shell:', height + 'px');
        }
      }

      // Enviar altura inicial
      setTimeout(sendHeightToShell, 1000);

      // Enviar altura cuando cambie el contenido
      const observer = new MutationObserver(() => {
        sendHeightToShell();
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true
      });

      // También enviar altura cuando cambie el tamaño de la ventana
      window.addEventListener('resize', () => {
        setTimeout(sendHeightToShell, 100);
      });
    })
    .catch((err) => console.error(err));
}
