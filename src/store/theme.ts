import type { ContentLayout, Radius, Theme } from '@/constants/themes'
import { PROJECT_RADIUS, PROJECT_THEME } from '@/constants/themes'

import { defineStore } from 'pinia'

export const useThemeStore = defineStore('system-config', () => {
  const radius = ref<Radius>(PROJECT_RADIUS)
  const setRadius = (newRadius: Radius = PROJECT_RADIUS) => {
    radius.value = newRadius
  }
  const theme = ref<Theme>(PROJECT_THEME)
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
  }

  const contentLayout = ref<ContentLayout>('centered')
  const setContentLayout = (newContentLayout: ContentLayout) => {
    contentLayout.value = newContentLayout
  }
  return {
    radius,
    setRadius,

    theme,
    setTheme,

    contentLayout,
    setContentLayout,
  }
}, {
  persist: true,
})
