<script setup lang="ts">
import type { SidebarWorkspace } from './types'
import { ArrowRight, Sparkles } from 'lucide-vue-next'
import { RouterPath } from '@/constants/route-path'
import { useSidebar } from '@/components/ui/sidebar'

const { workspace } = defineProps<{
  workspace: SidebarWorkspace
}>()

const { state, isMobile } = useSidebar()

const isCompact = computed(() => state.value === 'collapsed' && !isMobile.value)
</script>

<template>
  <router-link
    :to="RouterPath.DASHBOARD"
    class="group app-sidebar__workspace"
    :class="{ 'app-sidebar__workspace--compact': isCompact }"
    :title="workspace.title"
  >
    <div class="app-sidebar__workspace-top">
      <div class="app-sidebar__workspace-mark">
        <div class="app-sidebar__workspace-mark-core">
          CM
        </div>
      </div>

      <ArrowRight v-if="!isCompact" class="size-4 text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5" />
    </div>

    <div v-if="!isCompact" class="app-sidebar__workspace-copy">
      <div class="inline-flex items-center gap-2 text-[0.68rem] font-semibold tracking-[0.2em] uppercase text-slate-400">
        <Sparkles class="size-3.5 text-teal-700" />
        Workspace
      </div>
      <p class="mt-3 font-display text-[1.35rem] font-semibold tracking-[-0.05em] text-slate-950">
        {{ workspace.title }}
      </p>
      <p class="mt-2 text-sm leading-7 text-slate-600">
        {{ workspace.subtitle }}
      </p>
    </div>

    <div v-if="!isCompact" class="app-sidebar__workspace-metrics">
      <div>
        <span>项目</span>
        <strong>{{ workspace.projectCount }}</strong>
      </div>
      <div>
        <span>分组</span>
        <strong>{{ workspace.folderCount }}</strong>
      </div>
    </div>
  </router-link>
</template>
