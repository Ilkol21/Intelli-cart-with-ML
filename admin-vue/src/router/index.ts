// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import { authStore } from '@/stores/auth'
import ProductsView from '../views/ProductsView.vue';
import OrdersView from '../views/OrdersView.vue';
import UsersView from '../views/UsersView.vue';
import CourierOrdersView from '../views/CourierOrdersView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true, roles: ['admin'] }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    { path: '/products', name: 'products', component: ProductsView, meta: { requiresAuth: true, roles: ['admin'] } },
    { path: '/orders', name: 'orders', component: OrdersView, meta: { requiresAuth: true, roles: ['admin'] } },
    { path: '/users', name: 'users', component: UsersView, meta: { requiresAuth: true, roles: ['admin'] } },
    { path: '/courier', name: 'courier', component: CourierOrdersView, meta: { requiresAuth: true, roles: ['delivery', 'admin'] } },
  ]
})

router.beforeEach((to, from, next) => {
  if (to.name === 'login') return next();

  if (!authStore.token || !authStore.role) {
    authStore.setToken(null, null);
    return next({ name: 'login' });
  }

  const roles = to.meta.roles as string[] | undefined;
  if (roles && !roles.includes(authStore.role)) {
    return next(authStore.isDelivery ? { name: 'courier' } : { name: 'login' });
  }

  next();
})

export default router
