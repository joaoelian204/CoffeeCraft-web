import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';

import Historial from '../views/Historial.vue';
import Perfil from '../views/Perfil.vue';
import Ubicacion from '../views/Ubicacion.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/perfil'
  },
  {
    path: '/perfil',
    name: 'Perfil',
    component: Perfil,
  },
  {
    path: '/historial',
    name: 'Historial',
    component: Historial,
  },
  {
    path: '/ubicacion',
    name: 'Ubicacion',
    component: Ubicacion,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
