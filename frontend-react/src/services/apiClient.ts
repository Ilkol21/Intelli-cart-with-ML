// src/services/apiClient.ts
import axios from 'axios';

// Створюємо єдиний, централізований екземпляр axios
const apiClient = axios.create({
    baseURL: '/api', // Nginx автоматично перенаправить це на наш api-gateway
});

// Додаємо "interceptor", який буде автоматично додавати токен до кожного запиту
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Беремо токен з localStorage
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

export default apiClient;