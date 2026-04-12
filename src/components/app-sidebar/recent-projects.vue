<script setup lang="ts">
import type { SidebarRecentProject } from './types'
import { ArrowUpRight, Star } from 'lucide-vue-next'
import { useSidebar } from '@/components/ui/sidebar'

const { projects } = defineProps<{
  projects: SidebarRecentProject[]
}>()

const route = useRoute()
const { state, isMobile } = useSidebar()

const isCompact = computed(() => state.value === 'collapsed' && !isMobile.value)

function isActive(href: string) {
  return route.path === href
}
</script>

<template>
  <section v-if="projects.length && !isCompact" class="app-sidebar__recent">
    <div class="app-sidebar__recent-head">
      <p class="app-sidebar__section-kicker">
        最近项目
      </p>
      <p class="text-xs text-slate-400">
        继续上次的判断
      </p>
    </div>

    <div class="app-sidebar__recent-list">
      <router-link
        v-for="project in projects"
        :key="project.id"
        :to="project.href"
        class="group app-sidebar__recent-link"
        :class="{ 'app-sidebar__recent-link--active': isActive(project.href) }"
      >
        <span :class="project.accentClass" class="app-sidebar__recent-accent" />
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold text-slate-900">
            {{ project.title }}
          </p>
          <p class="mt-1 truncate text-[0.72rem] text-slate-500">
            {{ project.subtitle }}
          </p>
        </div>
        <Star v-if="project.isFavorite" class="size-3.5 fill-amber-400 text-amber-400" />
        <ArrowUpRight class="size-3.5 text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </router-link>
    </div>
  </section>
</template>
