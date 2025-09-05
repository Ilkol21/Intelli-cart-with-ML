
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { authStore } from './stores/auth'

const app = createApp(App)

// Ініціалізуємо токен в сховищі та встановлюємо заголовок при запуску
const token = localStorage.getItem('admin_token')
if (token) {
  // Цей виклик тепер автоматично встановить і заголовок в apiClient
  authStore.setToken(token, null);
}

app.use(router)

app.mount('#app')
