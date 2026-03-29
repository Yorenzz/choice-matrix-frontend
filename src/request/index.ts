import type {
  AxiosError,
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import axios from 'axios'
import qs from 'qs'
import { RouterPath } from '@/constants/route-path'
import pinia from '@/plugins/pinia/setup'
import { ResultEnum } from '@/request/types.ts'
import router from '@/router'
import { useAuthStore } from '@/store/auth'
import { getToken } from '@/utils/auth'

export interface ResponseData<T = unknown> {
  code: number
  data: T
  message: string
}

export interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  skipAuthRefresh?: boolean
  _retry?: boolean
}

interface ExtendedInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  skipAuthRefresh?: boolean
  _retry?: boolean
}

const resolveApiBaseUrl = () => {
  const rawBaseUrl = (import.meta.env.VITE_APP_API_BASE_URL || '').trim()
  if (!rawBaseUrl) {
    return '/api/v1'
  }

  return rawBaseUrl.endsWith('/api/v1')
    ? rawBaseUrl
    : `${rawBaseUrl.replace(/\/+$/, '')}/api/v1`
}

const request = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 600000,
  adapter: 'fetch',
  withCredentials: true,
})

const refreshClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 600000,
  adapter: 'fetch',
  withCredentials: true,
})

export type RequestError = AxiosError<{
  code?: number
  message?: string
  result?: unknown
  errorMessage?: string
}>

let refreshPromise: Promise<string | null> | null = null

const getAuthStore = () => useAuthStore(pinia)

const redirectToLogin = async () => {
  const authStore = getAuthStore()
  authStore.clearAuth()

  if (router.currentRoute.value.path !== RouterPath.LOGIN) {
    await router.push(RouterPath.LOGIN)
  }
}

const refreshAccessToken = async (): Promise<string | null> => {
  const authStore = getAuthStore()
  if (!refreshPromise) {
    refreshPromise = refreshClient.post<ResponseData<{
      access_token: string
    }>>('/auth/refresh', {}).then((response) => {
      const payload = response.data
      if (!payload || payload.code !== ResultEnum.SUCCESS) {
        throw new Error(payload?.message || '刷新登录状态失败')
      }

      authStore.updateAccessToken(payload.data.access_token)
      return payload.data.access_token
    }).catch(async (error) => {
      await redirectToLogin()
      throw error
    }).finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}

const errorHandler = async (error: RequestError): Promise<never> => {
  const status = error.response?.status
  const originalRequest = error.config as ExtendedInternalAxiosRequestConfig | undefined
  const errorMessage = error.response?.data?.message || error.response?.data?.errorMessage || error.message || '请求错误'

  if (
    status === 401
    && originalRequest
    && !originalRequest.skipAuthRefresh
    && !originalRequest._retry
  ) {
    originalRequest._retry = true

    try {
      const newAccessToken = await refreshAccessToken()
      if (!newAccessToken) {
        await redirectToLogin()
        return Promise.reject(error)
      }

      originalRequest.headers = originalRequest.headers || {}
      ;(originalRequest.headers as AxiosRequestHeaders).Authorization = `Bearer ${newAccessToken}`
      return request(originalRequest)
    }
    catch (refreshError) {
      return Promise.reject(refreshError)
    }
  }

  switch (status) {
    case 401:
      await redirectToLogin()
      console.error('未授权，请重新登录')
      break
    case 403:
      console.error('拒绝访问')
      break
    case 404:
      console.error('请求的资源不存在')
      break
    case 500:
      console.error('服务器错误')
      break
    default:
      console.error(errorMessage)
  }

  return Promise.reject(error)
}

const requestHandler = (
  config: ExtendedInternalAxiosRequestConfig,
): ExtendedInternalAxiosRequestConfig | Promise<ExtendedInternalAxiosRequestConfig> => {
  const data = config.data || false
  const token = getAuthStore().token || getToken()
  config.headers = config.headers || {}

  if (token) {
    ;(config.headers as AxiosRequestHeaders).Authorization = `Bearer ${token}`
  }

  if (
    config.method?.toUpperCase() === 'POST'
    && (config.headers as AxiosRequestHeaders)['Content-Type'] === 'application/x-www-form-urlencoded'
  ) {
    config.data = qs.stringify(data)
  }

  return config
}

request.interceptors.request.use(requestHandler, errorHandler)

const responseHandler = (response: AxiosResponse) => {
  const { data } = response
  if (!data) {
    throw new Error('请求没有返回数据')
  }

  const code = data.code || 200

  if (response.request.responseType === 'blob' || response.request.responseType === 'arraybuffer') {
    return response
  }

  if (code !== ResultEnum.SUCCESS) {
    throw new Error(data.message || '请求失败')
  }

  return data
}

request.interceptors.response.use(responseHandler, errorHandler)

export const createCancelToken = axios.CancelToken.source

interface UploadRequestConfig extends ExtendedAxiosRequestConfig {
  headersType?: string
  data?: FormData | Record<string, unknown>
}

export const api = {
  get: <T>(option: ExtendedAxiosRequestConfig): Promise<ResponseData<T>> => {
    return request({ method: 'GET', ...option })
  },

  post: <T>(option: ExtendedAxiosRequestConfig): Promise<ResponseData<T>> => {
    return request({ method: 'POST', ...option })
  },

  stream: (option: ExtendedAxiosRequestConfig): Promise<ReadableStream<Uint8Array> | null> => {
    return request({
      method: 'POST',
      responseType: 'stream',
      ...option,
    }).then((response) => {
      if (response instanceof Response) {
        return response.body
      }
      return null
    })
  },

  delete: <T>(option: ExtendedAxiosRequestConfig): Promise<ResponseData<T>> => {
    return request({ method: 'DELETE', ...option })
  },

  put: <T>(option: ExtendedAxiosRequestConfig): Promise<ResponseData<T>> => {
    return request({ method: 'PUT', ...option })
  },

  download: (option: ExtendedAxiosRequestConfig): Promise<Blob> => {
    return request({
      method: 'GET',
      responseType: 'blob',
      ...option,
    })
  },

  upload: <T>(option: UploadRequestConfig): Promise<ResponseData<T>> => {
    return request({
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...option,
    })
  },
}

export const retryRequest = async <T>(requestFn: () => Promise<T>, maxRetries = 3, delay = 1000): Promise<T> => {
  let retries = 0

  const execute = async (): Promise<T> => {
    try {
      return await requestFn()
    }
    catch (error) {
      if (retries < maxRetries) {
        retries++
        console.log(`请求失败，第 ${retries} 次重试...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        return execute()
      }
      throw error
    }
  }

  return execute()
}

export default request
