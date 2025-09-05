<script setup lang="ts">
import { RouterView } from 'vue-router'
import { authStore } from './stores/auth'
</script>

<template>
  <header>
    <div class="wrapper">
      <h1>Intelli-Cart Admin</h1>
      <nav v-if="authStore.token">
        <RouterLink to="/">Дашборд</RouterLink>
        <RouterLink to="/products">Товари</RouterLink>
      </nav>
      <button v-if="authStore.token" @click="authStore.logout()" class="logout-button">
        Вийти
      </button>
    </div>
  </header>
  <RouterView />
</template>


<style scoped>
header {
  line-height: 1.5;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 2rem;
}

.wrapper {
  /* Цей "clearfix" трюк змушує контейнер розтягнутися і містити в собі плаваючі елементи */
  overflow: auto;
}

h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  float: left; /* Вирівнюємо заголовок ліворуч */
}

.logout-button {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  background-color: #dc3545;
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
  float: right; /* Використовуємо float для розташування праворуч */
  margin-left: 1rem;
}

.logout-button:hover {
  background-color: #c82333;
}

nav {
  display: flex;
  gap: 20px;
}
nav a {
  text-decoration: none;
  color: var(--color-text);
}
nav a.router-link-exact-active {
  font-weight: bold;
}
</style>
