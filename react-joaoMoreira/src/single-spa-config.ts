// Configuración para Single-SPA
export const singleSpaConfig = {
  name: 'catalogoModule',
  app: () => import('./single-spa-entry'),
  activeWhen: (location: Location) => {
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
    domElement: document.getElementById('single-spa-application:catalogoModule/single-spa-entry')
  }
}; 