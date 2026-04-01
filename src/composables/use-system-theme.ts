import { storeToRefs } from 'pinia'
import { PROJECT_RADIUS, PROJECT_THEME, THEMES } from '@/constants/themes'
import { useThemeStore } from '@/store'

export const useSystemTheme = () => {
  const themeStore = useThemeStore()
  const { setTheme, setRadius } = themeStore
  const { theme, radius } = storeToRefs(themeStore)

  if (typeof document !== 'undefined') {
    watch(theme, (theme) => {
      const nextTheme = THEMES.includes(theme) ? theme : PROJECT_THEME
      if (nextTheme !== theme) {
        setTheme(nextTheme)
        return
      }

      document.documentElement.classList.remove(...THEMES.map(t => `theme-${t}`))
      document.documentElement.classList.add(`theme-${nextTheme}`)
    }, { immediate: true })

    watch(radius, (radius) => {
      const nextRadius = radius === PROJECT_RADIUS ? radius : PROJECT_RADIUS
      if (nextRadius !== radius) {
        setRadius()
        return
      }

      document.documentElement.style.setProperty('--radius', `${nextRadius}rem`)
    }, { immediate: true })
  }

  return {
    theme,
    radius,
    setTheme,
    setRadius,
  }
}
