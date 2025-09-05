<script setup lang="ts">
import { ref, onMounted } from 'vue'
import apiClient from '../services/api'; // <-- Правильний імпорт

const totalUsers = ref<number | null>(null)
const totalLists = ref<number | null>(null)
const error = ref<string | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const userResponse = await apiClient.get('/admin/stats/users');
    totalUsers.value = userResponse.data.totalUsers

    const listResponse = await apiClient.get('/admin/stats/lists');
    totalLists.value = listResponse.data.totalLists
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Не вдалося завантажити статистику.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main>
    <h2>Дашборд</h2>
    <div v-if="loading">Завантаження...</div>
    <div v-else-if="error" style="color: red">{{ error }}</div>
    <div v-else class="stats-container">
      <div class="stat-card">
        <h3>Загальна кількість користувачів</h3>
        <p>{{ totalUsers }}</p>
      </div>
      <div class="stat-card">
        <h3>Загальна кількість списків</h3>
        <p>{{ totalLists }}</p>
      </div>
    </div>
  </main>
</template>

<style scoped>
.stats-container {
  display: flex;
  gap: 20px;
}
.stat-card {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  text-align: center;
}
.stat-card p {
  font-size: 2rem;
  font-weight: bold;
}
</style>
