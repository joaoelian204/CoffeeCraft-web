import { initAngularApp as initApp } from './main';

let app: any = null;

export async function initAngularApp(container: HTMLElement) {
  if (app) {
    // Si ya hay una aplicación, la destruimos
    try {
      app.destroy();
    } catch (e) {
      console.log('App already destroyed');
    }
  }

  // Inicializar la aplicación Angular
  app = await initApp(container);
  
  return app;
}

export async function destroyAngularApp() {
  if (app) {
    try {
      app.destroy();
    } catch (e) {
      console.log('Error destroying app:', e);
    }
    app = null;
  }
} 