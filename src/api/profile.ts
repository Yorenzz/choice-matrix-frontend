import { api } from '@/request'

export type UserStatus = 'active' | 'disabled' | 'pending'
export type UserPlan = 'free' | 'pro'

export interface CurrentUser {
  id: number
  email: string
  nickname: string
  avatar_url: string
  status: UserStatus
  plan: UserPlan
  pro: boolean
  credits: number
  last_login_at?: string | null
  last_login_ip: string
  country_code: string
  region_name: string
  city_name: string
}

export function getCurrentUserApi() {
  return api.get<CurrentUser>({
    url: '/auth/me',
  })
}
