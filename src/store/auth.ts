import { defineStore } from 'pinia'
import { ref } from 'vue'
import { setToken, removeToken as removeAuthToken } from '@/utils/auth'
import type { UserInfo } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const isLogin = ref(false)
  const token = ref('')
  const userInfo = ref<UserInfo | null>(null)

  function setAuth(newToken: string, user: UserInfo) {
    token.value = newToken
    userInfo.value = user
    isLogin.value = true
    setToken(newToken)
  }

  function clearAuth() {
    token.value = ''
    userInfo.value = null
    isLogin.value = false
    removeAuthToken()
  }

  return {
    isLogin,
    token,
    userInfo,
    setAuth,
    clearAuth,
  }
}, {
  persist: true,
})
