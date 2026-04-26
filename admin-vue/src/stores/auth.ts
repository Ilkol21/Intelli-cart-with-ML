// src/stores/auth.ts
import { reactive } from 'vue';
// ↓ ↓ ↓ Приберіть імпорт { setAuthHeader } звідси ↓ ↓ ↓
import apiClient from '@/services/api';
import router from '@/router';

export const authStore = reactive({
  token: localStorage.getItem('admin_token') || null,
  user: JSON.parse(localStorage.getItem('admin_user') || 'null') as any,

  get role(): string {
    return (this.user as any)?.role || '';
  },

  get isAdmin(): boolean {
    return this.role === 'admin';
  },

  get isDelivery(): boolean {
    return this.role === 'delivery';
  },

  async login(credentials: { email: string; password: string }) {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      const role = response.data.user.role;

      if (role !== 'admin' && role !== 'delivery') {
        throw new Error('Access denied. Only admins and couriers can log in here.');
      }
      this.setToken(response.data.access_token, response.data.user);
      return response.data;
    } catch (error: any) {
      this.setToken(null, null);
      const errorMessage =
        error.response?.data?.error || error.message || 'Login failed';
      throw new Error(errorMessage);
    }
  },

  logout() {
    this.setToken(null, null);
    router.push('/login');
  },

  setToken(newToken: string | null, userData: any | null) {
    this.token = newToken;
    this.user = userData;

    if (newToken) {
      localStorage.setItem('admin_token', newToken);
      localStorage.setItem('admin_user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    }
  },
});
