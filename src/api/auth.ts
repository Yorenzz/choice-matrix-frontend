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

export interface UserInfo {
  id: number
  email: string
  nickname: string
  pro: boolean
  credits?: number
}

export interface LoginResult {
  token: string
  user: UserInfo
}

export function loginApi(data: LoginParams) {
  return api.post<LoginResult>({
    url: '/auth/login',
    data,
  })
}

export function registerApi(data: RegisterParams) {
  return api.post<null>({
    url: '/auth/register',
    data,
  })
}

export function getUserInfoApi() {
  return api.get<UserInfo>({
    url: '/auth/me',
  })
}
