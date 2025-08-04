import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import singleSpaReact from 'single-spa-react';
import CatalogoApp from './CatalogoApp';

const lifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: CatalogoApp,
  domElementGetter: () => {
    // Buscar el contenedor específico para este microfrontend
    let el = document.getElementById('single-spa-application:catalogoModule/single-spa-entry');
    if (!el) {
      el = document.createElement('div');
      el.id = 'single-spa-application:catalogoModule/single-spa-entry';
      document.body.appendChild(el);
    }
    return el;
  },
});

export const bootstrap = lifecycles.bootstrap;
export const mount = lifecycles.mount;
export const unmount = lifecycles.unmount;