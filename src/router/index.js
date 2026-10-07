import { createRouter, createWebHistory } from 'vue-router'
import { authService } from '../services/authService'

import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import PartidosView from '../views/PartidosView.vue'
import DisponibilidadView from '../views/DisponibilidadView.vue'
import FinanzasView from '../views/FinanzasView.vue'
import EstadisticasView from '../views/EstadisticasView.vue'
import SancionesView from '../views/SancionesView.vue'
import PerfilView from '../views/PerfilView.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false, title: 'Iniciar Sesión' }
  },
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true, title: 'Panel Árbitro' }
  },
  {
    path: '/partidos',
    name: 'partidos',
    component: PartidosView,
    meta: { requiresAuth: true, title: 'Mis Partidos' }
  },
  {
    path: '/disponibilidad',
    name: 'disponibilidad',
    component: DisponibilidadView,
    meta: { requiresAuth: true, title: 'Disponibilidad' }
  },
  {
    path: '/finanzas',
    name: 'finanzas',
    component: FinanzasView,
    meta: { requiresAuth: true, title: 'Estado de Cuenta' }
  },
  {
    path: '/estadisticas',
    name: 'estadisticas',
    component: EstadisticasView,
    meta: { requiresAuth: true, title: 'Estadísticas' }
  },
  {
    path: '/sanciones',
    name: 'sanciones',
    component: SancionesView,
    meta: { requiresAuth: true, title: 'Sanciones' }
  },
  {
    path: '/perfil',
    name: 'perfil',
    component: PerfilView,
    meta: { requiresAuth: true, title: 'Mi Perfil' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isAuth = authService.isAuthenticated()
  if (to.meta.requiresAuth && !isAuth) {
    next('/login')
  } else if (to.path === '/login' && isAuth) {
    next('/')
  } else {
    next()
  }
})

export default router

