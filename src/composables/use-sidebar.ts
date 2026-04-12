import type { NavGroup } from '@/components/app-sidebar/types'
import { LayoutDashboard, User } from 'lucide-vue-next'

export const useSidebar = () => {
  const navData = ref<NavGroup[]>([
    {
      title: '工作区',
      items: [
        { title: '决策工作台', url: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: '账户',
      items: [
        { title: '个人中心', url: '/profile', icon: User },
      ],
    },
  ])

  const otherPages = ref<NavGroup[]>([])

  return {
    navData,
    otherPages,
  }
}
