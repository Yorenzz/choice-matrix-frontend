<script lang="ts" setup>
import { useSidebarData } from './data/sidebar-data'
import NavFooter from './nav-footer.vue'
import NavTeam from './nav-team.vue'
import RecentProjects from './recent-projects.vue'
import WorkspaceOverview from './workspace-overview.vue'

const { sidebarData } = useSidebarData()
</script>

<template>
  <UiSidebar collapsible="icon" class="app-sidebar z-50 border-r border-white/60 bg-white/70 backdrop-blur-[18px]">
    <UiSidebarHeader class="app-sidebar__header">
      <WorkspaceOverview :workspace="sidebarData.workspace" />
    </UiSidebarHeader>

    <UiSidebarContent class="app-sidebar__content">
      <NavTeam :nav-main="sidebarData.navMain" />
      <RecentProjects :projects="sidebarData.recentProjects" />
    </UiSidebarContent>

    <UiSidebarFooter class="app-sidebar__footer">
      <NavFooter :user="sidebarData.user" />
    </UiSidebarFooter>

    <UiSidebarRail />
  </UiSidebar>
</template>
