import type { CurrentUser } from '@/api/profile'
import { api } from '@/request'

export interface LoginParams {
  email?: string
  password?: string
}

export interface RegisterParams {
  email?: string
  password?: string
  nickname?: string
}

export type UserInfo = CurrentUser

export interface LoginResult {
  token: string
  access_token: string
  user: UserInfo
}

export function loginApi(data: LoginParams) {
  return api.post<LoginResult>({
    url: '/auth/login',
    data,
  })
}

export function registerApi(data: RegisterParams) {
  return api.post<LoginResult>({
    url: '/auth/register',
    data,
  })
}

export function refreshTokenApi() {
  return api.post<LoginResult>({
    url: '/auth/refresh',
    skipAuthRefresh: true,
  })
}

export function logoutApi() {
  return api.post<null>({
    url: '/auth/logout',
    skipAuthRefresh: true,
  })
}

export function getUserInfoApi() {
  return api.get<CurrentUser>({
    url: '/auth/me',
  })
}
