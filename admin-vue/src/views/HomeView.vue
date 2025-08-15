<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchUserStats, fetchListStats } from '../services/api'

const totalUsers = ref<number | null>(null)
const totalLists = ref<number | null>(null)
const error = ref<string | null>(null)
const loading = ref(true)

onMounted(async () => {
  // Тепер логіка отримання токена знаходиться в роутері та auth store
  try {
    const userResponse = await fetchUserStats()
    totalUsers.value = userResponse.data.totalUsers

    const listResponse = await fetchListStats()
    totalLists.value = listResponse.data.totalLists
  } catch (err: any) {
    console.error('Failed to fetch stats:', err)
    error.value = err.response?.data?.message || 'Не вдалося завантажити статистику.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main>
    <h2>Дашборд</h2>

    <div v-if="loading">
      <p>Завантаження статистики...</p>
    </div>

    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
    </div>

    <div v-if="!loading && !error" class="stats-container">
      <div class="stat-card">
        <h3>Загальна кількість користувачів</h3>
        <p class="stat-number">{{ totalUsers }}</p>
      </div>
      <div class="stat-card">
        <h3>Загальна кількість списків</h3>
        <p class="stat-number">{{ totalLists }}</p>
      </div>
    </div>
  </main>
</template>

<style scoped>
.stats-container {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}
.stat-card {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  flex-grow: 1;
}
.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0;
}
.error-message {
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 15px;
  border-radius: 8px;
}
</style>
