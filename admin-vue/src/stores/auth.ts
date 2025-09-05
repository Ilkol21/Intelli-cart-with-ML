// src/stores/auth.ts
import { reactive } from 'vue';
// ↓ ↓ ↓ Приберіть імпорт { setAuthHeader } звідси ↓ ↓ ↓
import apiClient from '@/services/api';
import router from '@/router';

export const authStore = reactive({
  token: localStorage.getItem('admin_token') || null,
  user: null,

  async login(credentials: { email: string; password: string }) {
    try {
      const response = await apiClient.post('/auth/login', credentials);

      if (response.data.user.role !== 'admin') {
        throw new Error('You are not an administrator.');
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

    // ↓ ↓ ↓ Приберіть цей рядок, він більше не потрібен ↓ ↓ ↓
    // setAuthHeader(newToken);

    if (newToken) {
      localStorage.setItem('admin_token', newToken);
    } else {
      localStorage.removeItem('admin_token');
    }
  },
});
