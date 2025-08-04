import { initAngularApp } from './main';

// Exponer la función de inicialización globalmente
(window as any).initAngularApp = initAngularApp;

// Función para cargar el módulo Angular
export async function loadAngularModule(container: HTMLElement) {
  try {
    console.log('🔄 Inicializando aplicación Angular...');
    const app = await initAngularApp(container);
    console.log('✅ Aplicación Angular inicializada correctamente');
    return app;
  } catch (error) {
    console.error('❌ Error inicializando Angular:', error);
    throw error;
  }
}

// Función para destruir la aplicación
export async function destroyAngularApp() {
  // La aplicación se destruye automáticamente cuando se recarga
  console.log('🔄 Destruyendo aplicación Angular...');
} 