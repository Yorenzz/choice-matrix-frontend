<script setup lang="ts">
import type { SidebarWorkspace } from './types'
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
    <div class="app-sidebar__workspace-mark">
      <div class="app-sidebar__workspace-mark-core">
        CM
      </div>
    </div>

    <div v-if="!isCompact" class="app-sidebar__workspace-copy">
      <p class="text-[0.68rem] font-semibold tracking-[0.2em] uppercase text-slate-400">
        Decision Studio
      </p>
      <p class="mt-1.5 font-display text-[1.15rem] font-semibold tracking-[-0.04em] text-slate-950">
        {{ workspace.title }}
      </p>
    </div>
  </router-link>

  <div v-if="!isCompact" class="app-sidebar__workspace-status">
    <div class="app-sidebar__workspace-status-head">
      <span>Workspace</span>
      <strong>{{ workspace.completionRatio }}%</strong>
    </div>
    <div class="app-sidebar__workspace-meter" aria-hidden="true">
      <span :style="{ width: `${workspace.completionRatio}%` }" />
    </div>
    <div class="app-sidebar__workspace-stats">
      <span>{{ workspace.projectCount }} 个项目</span>
      <span>{{ workspace.scoreColumnCount }} 个评分维度</span>
    </div>
  </div>
</template>
