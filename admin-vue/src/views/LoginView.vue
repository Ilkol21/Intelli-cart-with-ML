<script setup lang="ts">
import { ref } from 'vue'
import { authStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { styles } from '@/styles'

const email = ref('')
const password = ref('')
const error = ref<string | null>(null)
const router = useRouter()

const handleLogin = async () => {
  error.value = null
  try {
    await authStore.login({ email: email.value, password: password.value })
    router.push('/')
  } catch (err: any) {
    error.value = err
  }
}
</script>

<template>
  <div>
    <h2>Вхід для адміністратора</h2>
    <form @submit.prevent="handleLogin" :style="styles.form">
      <input
        type="email"
        placeholder="Email"
        v-model="email"
        required
        :style="styles.input"
      />
      <input
        type="password"
        placeholder="Password"
        v-model="password"
        required
        :style="styles.input"
      />
      <button type="submit" :style="styles.button">Увійти</button>
      <p v-if="error" style="color: red">{{ error }}</p>
    </form>
  </div>
</template>
