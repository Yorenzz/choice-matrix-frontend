import type { LoginParams, RegisterParams } from '@/api/auth'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { loginApi, logoutApi, registerApi } from '@/api/auth'
import { RouterPath } from '@/constants/route-path'
import { useAuthStore } from '@/store/auth'

export function useAuth() {
  const router = useRouter()
  const authStore = useAuthStore()
  const loading = ref(false)

  async function logout() {
    try {
      await logoutApi()
    }
    catch (error) {
      console.error(error)
    }
    finally {
      authStore.clearAuth()
      router.push({ path: RouterPath.LOGIN as string })
    }
  }

  function toHome() {
    router.push({ path: RouterPath.DASHBOARD as string })
  }

  async function login(params: LoginParams) {
    loading.value = true
    try {
      const { data } = await loginApi(params)
      authStore.setAuth(data.access_token, data.user)

      const redirect = router.currentRoute.value.query.redirect as string
      if (!redirect || redirect.startsWith('//')) {
        toHome()
      }
      else {
        router.push(redirect)
      }
    }
    catch (error: any) {
      toast.error(error.message || '登录失败 / Login failed')
      console.error(error)
    }
    finally {
      loading.value = false
    }
  }

  async function register(params: RegisterParams) {
    loading.value = true
    try {
      const { data } = await registerApi(params)
      authStore.setAuth(data.access_token, data.user)
      toast.success('注册成功，已自动登录')
      toHome()
    }
    catch (error: any) {
      toast.error(error.message || '注册失败 / Registration failed')
      console.error(error)
    }
    finally {
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
