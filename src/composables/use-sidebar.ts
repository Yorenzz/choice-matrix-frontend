import type { NavGroup } from '@/components/app-sidebar/types'
import { Bug, LayoutDashboard, ListTodo, SquareUserRound, User } from 'lucide-vue-next'

export const useSidebar = () => {
  const settingsNavItems = [
    { title: '个人中心', url: '/profile', icon: User },
  ]

  const navData = ref<NavGroup[]>([
    {
      title: '核心功能',
      items: [
        { title: '工作台', url: '/dashboard', icon: LayoutDashboard },
        { title: '决策列表', url: '/tasks', icon: ListTodo },
        { title: '个人中心', url: '/profile', icon: User },
      ],
    },
    {
      title: '辅助页面',
      items: [
        {
          title: '认证',
          icon: SquareUserRound,
          items: [
            { title: '登录', url: '/auth/sign-in' },
            { title: '注册', url: '/auth/sign-up' },
          ],
        },
        {
          title: '错误页',
          icon: Bug,
          items: [
            { title: '401 | Unauthorized', url: '/errors/401' },
            { title: '403 | Forbidden', url: '/errors/403' },
            { title: '404 | Not Found', url: '/errors/404' },
            { title: '500 | Internal Server Error', url: '/errors/500' },
            { title: '503 | Maintenance Error', url: '/errors/503' },
          ],
        },
      ],
    },
  ])

  const otherPages = ref<NavGroup[]>([])

  return {
    navData,
    otherPages,
    settingsNavItems,
  }
}
