import type { RouteLocationRaw } from 'vue-router'

export const RouterPath: Record<string, RouteLocationRaw> = {
  HOME: '/dashboard',
  PROFILE: '/profile',
  GUEST_MATRIX: '/guest-matrix',
  LOGIN: '/auth/sign-in',
  REGISTER: '/auth/sign-up',
} as const
