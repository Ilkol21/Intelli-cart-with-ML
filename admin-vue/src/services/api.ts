// admin-vue/src/services/api.ts
import axios from "axios";

const apiClient = axios.create({
  baseURL: '/api', // Nginx автоматично перенаправить це на наш api-gateway
});

// Функція для встановлення JWT-токена в заголовки
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// Функції для отримання статистики
export const fetchUserStats = () => {
  return apiClient.get('/admin/stats/users');
};

export const fetchListStats = () => {
  return apiClient.get('/admin/stats/lists');
};
