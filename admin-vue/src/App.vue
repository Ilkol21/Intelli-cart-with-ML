<script setup lang="ts">
import { RouterView } from 'vue-router'
import { authStore } from './stores/auth'
</script>

<template>
  <div>
    <header>
      <div class="wrapper">
        <button v-if="authStore.token" @click="authStore.logout()" class="logout-button">
          Вийти
        </button>
        <h1>Intelli-Cart Admin</h1>
      </div>
    </header>

    <RouterView />
  </div>
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
</style>
