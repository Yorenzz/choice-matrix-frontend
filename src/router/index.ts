import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import { RouterPath } from '@/constants/route-path'
import pinia from '@/plugins/pinia/setup'
import { useAuthStore } from '@/store/auth'
import { getToken } from '@/utils/auth'

const baseRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Home/index.vue'),
  },
  {
    path: '/dashboard',
    component: () => import('@/layouts/index.vue'),
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/views/Dashboard/index.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/projects',
    component: () => import('@/layouts/index.vue'),
    children: [
      {
        path: ':id',
        name: 'project-detail',
        component: () => import('@/views/ProjectDetail/index.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/tasks',
    component: () => import('@/layouts/index.vue'),
    children: [
      {
        path: '',
        name: 'tasks',
        component: () => import('@/views/Tasks/index.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/profile',
    component: () => import('@/layouts/index.vue'),
    children: [
      {
        path: '',
        name: 'profile',
        component: () => import('@/views/Profile/index.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/auth',
    children: [
      {
        path: 'sign-in',
        name: 'sign-in',
        component: () => import('@/views/Auth/SignIn.vue'),
        meta: { guestOnly: true },
      },
      {
        path: 'sign-up',
        name: 'sign-up',
        component: () => import('@/views/Auth/SignUp.vue'),
        meta: { guestOnly: true },
      },
    ],
  },
  {
    path: '/guest-matrix',
    name: 'guest-matrix',
    component: () => import('@/views/GuestMatrix/index.vue'),
  },
  {
    path: '/errors',
    children: [
      {
        path: '401',
        name: 'error-401',
        component: () => import('@/views/Errors/401.vue'),
      },
      {
        path: '403',
        name: 'error-403',
        component: () => import('@/views/Errors/403.vue'),
      },
      {
        path: '404',
        name: 'error-404',
        component: () => import('@/views/Errors/404.vue'),
      },
      {
        path: '500',
        name: 'error-500',
        component: () => import('@/views/Errors/500.vue'),
      },
      {
        path: '503',
        name: 'error-503',
        component: () => import('@/views/Errors/503.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_APP_PUBLIC_PATH),
  routes: baseRoutes,
  scrollBehavior: (_, __, savedPosition) => savedPosition || { top: 0, left: 0 },
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore(pinia)
  const localToken = getToken() || ''
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const guestOnly = to.matched.some(record => record.meta.guestOnly)

  authStore.token = localToken || authStore.token

  if ((localToken || requiresAuth) && !authStore.userInfo) {
    try {
      await authStore.bootstrapAuth()
    }
    catch {
      if (requiresAuth) {
        return {
          path: RouterPath.LOGIN as string,
          query: { redirect: to.fullPath },
        }
      }
    }
  }

  const hasToken = !!authStore.token

  if (requiresAuth && !hasToken) {
    return {
      path: RouterPath.LOGIN as string,
      query: { redirect: to.fullPath },
    }
  }

  if (guestOnly && hasToken) {
    return { path: RouterPath.DASHBOARD as string }
  }

  return true
})

export const resetRouter = async () => {}

export default router
