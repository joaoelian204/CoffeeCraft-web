
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'suscripciones',
    pathMatch: 'full'
  },
  {
    path: 'suscripciones',
    loadComponent: () => import('./componentes/subscripcion/subscripcion.component').then(m => m.PlanesSuscripcionComponent)
  },
  {
    path: 'carrito',
    loadComponent: () => import('./componentes/carrito/carrito.component').then(m => m.CarritoComponent)
  },
  {
    path: 'clima',
    loadComponent: () => import('./componentes/clima/clima.component').then(m => m.ClimaComponent)
  },
  // ...otras rutas...
  {
    path: '**',
    redirectTo: 'suscripciones'
  }
];
