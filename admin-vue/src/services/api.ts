// src/services/api.ts
import axios from 'axios';

// Створюємо екземпляр axios БЕЗ імпорту authStore на верхньому рівні
const apiClient = axios.create({
  baseURL: '/api',
});

// Додаємо перехоплювач запитів
apiClient.interceptors.request.use(
  async (config) => {
    // ІМПОРТУЄМО authStore ДИНАМІЧНО ПРЯМО ТУТ
    // Це гарантує, що модуль auth.ts вже повністю завантажений
    const { authStore } = await import('@/stores/auth');

    const token = authStore.token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // Для перевірки можна додати логування
    // console.log('Request Headers:', config.headers);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
