// src/stores/auth.ts
import { reactive } from 'vue'
import { setAuthToken } from '@/services/api'
import axios from 'axios'
import router from '@/router'

export const authStore = reactive({
  token: localStorage.getItem('admin_token') || null,
  user: null,

  login(credentials: { email: string, password: string }) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await axios.post('/api/auth/login', credentials)
        if (response.data.user.role !== 'admin') {
          throw new Error('You are not an administrator.');
        }
        this.setToken(response.data.access_token, response.data.user)
        resolve(response.data)
      } catch (error: any) {
        this.setToken(null, null)
        const errorMessage = error.response?.data?.error || error.message || 'Login failed'
        reject(errorMessage)
      }
    })
  },

  logout() {
    this.setToken(null, null)
    router.push('/login')
  },

  setToken(newToken: string | null, userData: any | null) {
    this.token = newToken
    this.user = userData
    if (newToken) {
      localStorage.setItem('admin_token', newToken)
    } else {
      localStorage.removeItem('admin_token')
    }
    setAuthToken(newToken)
  }
})
