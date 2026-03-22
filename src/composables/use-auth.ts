import { loginApi, registerApi, type LoginParams, type RegisterParams } from '@/api/auth'
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { toast } from 'vue-sonner'

export function useAuth() {
  const router = useRouter()
  const authStore = useAuthStore()
  const loading = ref(false)

  function logout() {
    authStore.clearAuth()
    router.push({ path: '/auth/sign-in' })
  }

  function toHome() {
    router.push({ path: '/dashboard' }) // Redirect to dashboard
  }

  async function login(params: LoginParams) {
    loading.value = true
    try {
      const { data } = await loginApi(params)
      authStore.setAuth(data.token, data.user)
      
      const redirect = router.currentRoute.value.query.redirect as string
      if (!redirect || redirect.startsWith('//')) {
        toHome()
      } else {
        router.push(redirect)
      }
    } catch (error: any) {
      toast.error(error.message || '登录失败 / Login failed')
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  async function register(params: RegisterParams) {
    loading.value = true
    try {
      await registerApi(params)
      // Login automatically or go back to login page
      router.push({ path: '/auth/sign-in' })
    } catch (error: any) {
      toast.error(error.message || '注册失败 / Registration failed')
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    logout,
    login,
    register,
  }
}
