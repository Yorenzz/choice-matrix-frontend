import type { SidebarData, Team, User } from '../types'
import { computed } from 'vue'
import { AudioWaveform, Command, GalleryVerticalEnd } from 'lucide-vue-next'
import { useSidebar } from '@/composables/use-sidebar'
import { useAuthStore } from '@/store/auth'

const teams: Team[] = [
  {
    name: 'Choice Matrix',
    logo: GalleryVerticalEnd,
    plan: 'Core',
  },
  {
    name: 'Personal',
    logo: AudioWaveform,
    plan: 'Workspace',
  },
  {
    name: 'AI Assistant',
    logo: Command,
    plan: 'Beta',
  },
]

export const useSidebarData = () => {
  const authStore = useAuthStore()
  const { navData } = useSidebar()

  const user = computed<User>(() => ({
    name: authStore.userInfo?.nickname || 'Choice Matrix',
    email: authStore.userInfo?.email || '未登录',
    avatar: '',
  }))

  const sidebarData = computed<SidebarData>(() => ({
    user: user.value,
    teams,
    navMain: navData.value,
  }))

  return {
    sidebarData,
  }
}
