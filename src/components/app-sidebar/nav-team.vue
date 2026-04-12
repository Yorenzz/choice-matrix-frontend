<script lang="ts" setup>
import type { NavGroup, NavItem } from './types'

import {
  ChevronRight,
} from 'lucide-vue-next'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'

const { navMain } = defineProps<{
  navMain: NavGroup[]
}>()

const route = useRoute()

const { state, isMobile } = useSidebar()

const isCollapsed = (menu: NavItem): boolean => !!menu.items?.some(item => item.url === route.path)

const isActive = (menu: NavItem): boolean => {
  const pathname = route.path
  if (menu.url) {
    return pathname === menu.url
  }
  return !!menu.items?.some(item => item.url === pathname)
}
</script>

<template>
  <SidebarGroup v-for="group in navMain" :key="group.title" class="app-sidebar__group">
    <SidebarGroupLabel class="app-sidebar__group-label">{{ group.title }}</SidebarGroupLabel>
    <SidebarMenu class="gap-1.5">
      <template v-for="menu in group.items" :key="menu.title">
        <SidebarMenuItem v-if="!menu.items">
          <SidebarMenuButton as-child :is-active="isActive(menu)" :tooltip="menu.title" class="app-sidebar__menu-button">
            <router-link :to="menu.url">
              <span class="app-sidebar__menu-icon">
                <component :is="menu.icon" />
              </span>
              <span>{{ menu.title }}</span>
            </router-link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem v-else>
          <!-- sidebar expanded -->
          <Collapsible
            v-if="state !== 'collapsed' || isMobile"
            as-child :default-open="isCollapsed(menu)"
            class="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger as-child>
                <SidebarMenuButton :tooltip="menu.title" class="app-sidebar__menu-button">
                  <span v-if="menu.icon" class="app-sidebar__menu-icon">
                    <component :is="menu.icon" />
                  </span>
                  <span>{{ menu.title }}</span>
                  <ChevronRight
                    class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                  />
                </SidebarMenuButton>
              </CollapsibleTrigger>
            </SidebarMenuItem>
            <CollapsibleContent>
              <SidebarMenuSub class="mt-1 gap-1 border-l border-slate-200/80 pl-2.5">
                <SidebarMenuSubItem v-for="subItem in menu.items" :key="subItem.title">
                  <SidebarMenuSubButton as-child :is-active="isActive(subItem as NavItem)" class="app-sidebar__sub-button">
                    <router-link :to="subItem?.url || '/'">
                      <component :is="subItem.icon" v-if="subItem.icon" />
                      <span>{{ subItem.title }}</span>
                    </router-link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>

          <!-- sidebar collapsed -->
          <DropdownMenu v-else>
            <DropdownMenuTrigger as-child>
              <SidebarMenuButton :tooltip="menu.title" class="app-sidebar__menu-button">
                <span v-if="menu.icon" class="app-sidebar__menu-icon">
                  <component :is="menu.icon" />
                </span>
                <span>{{ menu.title }}</span>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="right" class="rounded-2xl border border-white/80 bg-white/92 p-2 shadow-[0_24px_80px_rgba(15,23,42,0.14)] backdrop-blur-[20px]">
              <DropdownMenuLabel>{{ menu.title }}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem v-for="subItem in menu.items" :key="subItem.title" as-child class="rounded-xl px-3 py-2 text-sm text-slate-700">
                <router-link :to="subItem?.url || '/'">
                  <component :is="subItem.icon" v-if="subItem.icon" />
                  <span>{{ subItem.title }}</span>
                </router-link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </template>
    </SidebarMenu>
  </SidebarGroup>
</template>
