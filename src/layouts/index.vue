<script setup lang="ts">
import { useCookies } from '@vueuse/integrations/useCookies'
import { storeToRefs } from 'pinia'

import AppSidebar from '@/components/app-sidebar/index.vue'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
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
    <SidebarInset class="w-full max-w-full min-w-0 overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_rgba(14,116,144,0.12),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.1),_transparent_26%),linear-gradient(135deg,_#f4f7f6_0%,_#f7f9fc_48%,_#fbf7f1_100%)] peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)] peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]">
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
