// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import { authStore } from '@/stores/auth'
import ProductsView from '../views/ProductsView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true } // Цей маршрут вимагає аутентифікації
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    { path: '/products', name: 'products', component: ProductsView, meta: { requiresAuth: true } }
  ]
})

// Навігаційний "охоронець"
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !authStore.token) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router
