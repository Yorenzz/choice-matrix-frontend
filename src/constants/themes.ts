import { MoveHorizontal, UnfoldHorizontal } from 'lucide-vue-next'

export const PROJECT_THEME = 'studio' as const
export const PROJECT_RADIUS = 0.75 as const

export const THEMES = [PROJECT_THEME] as const
export type Theme = typeof THEMES[number]

export const THEME_PRIMARY_COLORS: { theme: Theme, primaryColor: string }[] = [
  { theme: PROJECT_THEME, primaryColor: 'oklch(0.62 0.12 188)' },
] as const

export type Radius = typeof RADIUS[number]
export const RADIUS = [0, 0.25, 0.5, 0.75, 1] as const

export type ContentLayout = 'full' | 'centered'
export const CONTENT_LAYOUTS = [
  { label: 'Full', value: 'full', icon: UnfoldHorizontal },
  { label: 'Centered', value: 'centered', icon: MoveHorizontal },
] as const
