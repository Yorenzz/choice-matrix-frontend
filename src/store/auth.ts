import type { UserInfo } from '@/api/auth'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { refreshTokenApi } from '@/api/auth'
import { getCurrentUserApi } from '@/api/profile'
import { clearAuthTokens, setToken } from '@/utils/auth'

export const useAuthStore = defineStore('auth', () => {
  const isLogin = ref(false)
  const token = ref('')
  const userInfo = ref<UserInfo | null>(null)
  const isBootstrapping = ref(false)

  function setAuth(newToken: string, user: UserInfo) {
    token.value = newToken
    userInfo.value = user
    isLogin.value = true
    setToken(newToken)
  }

  function updateAccessToken(newToken: string) {
    token.value = newToken
    setToken(newToken)
  }

  function clearAuth() {
    token.value = ''
    userInfo.value = null
    isLogin.value = false
    clearAuthTokens()
  }

  async function fetchCurrentUser() {
    const response = await getCurrentUserApi()
    userInfo.value = response.data
    isLogin.value = true
    return response.data
  }

  async function bootstrapAuth() {
    if (userInfo.value) {
      isLogin.value = true
      return userInfo.value
    }

    if (isBootstrapping.value) {
      return userInfo.value
    }

    isBootstrapping.value = true
    try {
      if (token.value) {
        try {
          return await fetchCurrentUser()
        }
        catch {
          const response = await refreshTokenApi()
          setAuth(response.data.access_token, response.data.user)
          return response.data.user
        }
      }

      const response = await refreshTokenApi()
      setAuth(response.data.access_token, response.data.user)
      return response.data.user
    }
    catch (error) {
      clearAuth()
      throw error
    }
    finally {
      isBootstrapping.value = false
    }
  }

  return {
    isLogin,
    token,
    userInfo,
    isBootstrapping,
    setAuth,
    updateAccessToken,
    clearAuth,
    fetchCurrentUser,
    bootstrapAuth,
  }
}, {
  persist: true,
})
