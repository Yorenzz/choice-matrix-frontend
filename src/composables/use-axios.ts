import type { AxiosError } from 'axios'

import axios from 'axios'

export function useAxios() {
  const baseURL = (import.meta.env.VITE_APP_API_BASE_URL || '/api/v1').trim()
  const normalizedBaseURL = baseURL.endsWith('/api/v1')
    ? baseURL
    : `${baseURL.replace(/\/+$/, '')}/api/v1`

  const axiosInstance = axios.create({
    baseURL: normalizedBaseURL,
    timeout: 60000,
  })

  axiosInstance.interceptors.request.use((config) => {
    return config
  }, (error) => {
    return Promise.reject(error)
  })

  axiosInstance.interceptors.response.use((response) => {
    return response
  }, (error: AxiosError) => {
    // if status is not 2xx, throw error
    // you can handle error here
    return Promise.reject(error)
  })

  return {
    axiosInstance,
  }
}
