// Configuración de Single-SPA para CoffeCraft Ecuador
import { registerApplication, start } from "single-spa";

// Declaración de tipos para SystemJS
declare const System: {
  import: (module: string) => Promise<any>;
};

// Registrar la aplicación del catálogo
registerApplication({
  name: "catalogoModule/single-spa-entry",
  app: () => {
    // Cargar el microfrontend usando SystemJS
    return System.import("catalogoModule/single-spa-entry").catch(error => {
      console.error('❌ Error cargando microfrontend:', error);
      // Retornar una aplicación vacía si falla la carga
      return Promise.resolve({
        bootstrap: () => Promise.resolve(),
        mount: () => Promise.resolve(),
        unmount: () => Promise.resolve()
      });
    });
  },
  activeWhen: (location) => {
    return location.pathname.startsWith('/catalogo') || 
           location.pathname.startsWith('/experiencias') || 
           location.pathname.startsWith('/recomendaciones') ||
           location.pathname.startsWith('/carrito') ||
           location.pathname.startsWith('/suscripciones') ||
           location.pathname.startsWith('/perfil') ||
           location.pathname.startsWith('/login') ||
           location.pathname.startsWith('/registro') ||
           location.pathname.startsWith('/admin');
  },
  customProps: {
    domElementGetter: () => {
      let el = document.getElementById('single-spa-application:catalogoModule/single-spa-entry');
      if (!el) {
        el = document.createElement('div');
        el.id = 'single-spa-application:catalogoModule/single-spa-entry';
        document.body.appendChild(el);
      }
      return el;
    }
  }
});

// Iniciar Single-SPA
start();
