import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import singleSpaReact from 'single-spa-react';
import App from './App';

// Configuración para Single-SPA
const lifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: App,
  domElementGetter: () => {
    console.log('🔍 Buscando contenedor del microfrontend...');
    // Buscar el contenedor específico para este microfrontend
    let el = document.getElementById('single-spa-application:catalogoModule/single-spa-entry');
    if (!el) {
      console.log('⚠️ Contenedor no encontrado, creando uno nuevo...');
      el = document.createElement('div');
      el.id = 'single-spa-application:catalogoModule/single-spa-entry';
      document.body.appendChild(el);
    } else {
      console.log('✅ Contenedor encontrado');
    }
    return el;
  },
});

// Exportar las funciones directamente
export const bootstrap = lifecycles.bootstrap;
export const mount = lifecycles.mount;
export const unmount = lifecycles.unmount;

// También exportar como objeto por defecto
export default {
  bootstrap: lifecycles.bootstrap,
  mount: lifecycles.mount,
  unmount: lifecycles.unmount,
};
