import type { LucideProps } from 'lucide-vue-next'
import type { FunctionalComponent } from 'vue'

type NavIcon = FunctionalComponent<LucideProps, Record<any, any>, any, Record<any, any>>

interface BaseNavItem {
  title: string
  icon?: NavIcon
}

export type NavItem
  = | BaseNavItem & {
    items: (BaseNavItem & { url?: string })[]
    url?: never
    isActive?: boolean
  } | BaseNavItem & {
    url: string
    items?: never
  }

export interface NavGroup {
  title: string
  items: NavItem[]
}

export interface User {
  name: string
  avatar: string
  email: string
}

export interface SidebarWorkspace {
  title: string
  projectCount: number
  scoreColumnCount: number
  completionRatio: number
}

export interface SidebarRecentProject {
  id: string
  title: string
  subtitle: string
  href: string
  accentClass: string
  isFavorite: boolean
}

export interface Team {
  name: string
  logo: NavIcon
  plan: string
}

export interface SidebarData {
  user: User
  workspace: SidebarWorkspace
  recentProjects: SidebarRecentProject[]
  navMain: NavGroup[]
}
