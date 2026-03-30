<script setup lang="ts">
import { useCookies } from '@vueuse/integrations/useCookies'
import { storeToRefs } from 'pinia'

import AppSidebar from '@/components/app-sidebar/index.vue'
import CommandMenuPanel from '@/components/command-menu-panel/index.vue'
import ThemePopover from '@/components/custom-theme/theme-popover.vue'
import ToggleTheme from '@/components/toggle-theme.vue'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { SIDEBAR_COOKIE_NAME } from '@/components/ui/sidebar/utils'
import { cn } from '@/lib/utils'
import { useThemeStore } from '@/store'

const defaultOpen = useCookies([SIDEBAR_COOKIE_NAME])
const themeStore = useThemeStore()
const { contentLayout } = storeToRefs(themeStore)
</script>

<template>
  <SidebarProvider :default-open="defaultOpen.get(SIDEBAR_COOKIE_NAME)">
    <AppSidebar />
    <SidebarInset class="w-full max-w-full min-w-0 overflow-x-hidden peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)] peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]">
      <header
        class="flex h-auto min-h-16 flex-wrap items-center gap-3 p-3 sm:gap-4 sm:p-4 shrink-0 transition-[width,height] ease-linear"
      >
        <SidebarTrigger class="-ml-1" />
        <Separator orientation="vertical" class="h-6" />
        <CommandMenuPanel />
        <div class="flex-1" />
        <div class="ml-auto flex items-center gap-2 sm:gap-4">
          <ToggleTheme />
          <ThemePopover />
        </div>
      </header>
      <div
        :class="cn(
          'min-w-0 grow p-3 sm:p-4',
          contentLayout === 'centered' ? 'container mx-auto ' : '',
        )"
      >
        <router-view />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
