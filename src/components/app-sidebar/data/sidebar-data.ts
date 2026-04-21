import type { SidebarData, SidebarRecentProject, SidebarWorkspace, User } from '../types'
import { computed } from 'vue'
import { RouterPath } from '@/constants/route-path'
import { useSidebar } from '@/composables/use-sidebar'
import { useAuthStore } from '@/store/auth'
import { useDecisionWorkspaceStore } from '@/store/decision-workspace'

export const useSidebarData = () => {
  const authStore = useAuthStore()
  const workspaceStore = useDecisionWorkspaceStore()
  const { navData } = useSidebar()

  const user = computed<User>(() => ({
    name: authStore.userInfo?.nickname || 'Choice Matrix',
    email: authStore.userInfo?.email || '未登录',
    avatar: '',
  }))

  const workspace = computed<SidebarWorkspace>(() => ({
    title: 'Choice Matrix',
    projectCount: workspaceStore.projects.length,
    scoreColumnCount: workspaceStore.projects.reduce((total, project) => {
      return total + project.columns.filter(column => column.type === 'score').length
    }, 0),
    completionRatio: resolveWorkspaceCompletion(workspaceStore.projects),
  }))

  const recentProjects = computed<SidebarRecentProject[]>(() => {
    const folderMap = new Map(workspaceStore.folders.map(folder => [folder.id, folder]))

    return [...workspaceStore.projects]
      .sort((left, right) => {
        return new Date(right.lastOpenedAt).getTime() - new Date(left.lastOpenedAt).getTime()
      })
      .slice(0, 4)
      .map((project) => {
        const folder = project.folderId ? folderMap.get(project.folderId) : undefined
        const folderName = folder?.name ?? '未分组'

        return {
          id: project.id,
          title: project.title,
          subtitle: `${folderName} · ${project.rows.length} 项候选 / ${project.columns.length} 维度`,
          href: `${RouterPath.PROJECTS}/${project.id}`,
          accentClass: folder?.accent ?? 'bg-slate-400',
          isFavorite: project.isFavorite,
        }
      })
  })

  const sidebarData = computed<SidebarData>(() => ({
    user: user.value,
    workspace: workspace.value,
    recentProjects: recentProjects.value,
    navMain: navData.value,
  }))

  return {
    sidebarData,
  }
}

function resolveWorkspaceCompletion(projects: ReturnType<typeof useDecisionWorkspaceStore>['projects']) {
  let filled = 0
  let total = 0

  projects.forEach((project) => {
    total += project.rows.length * project.columns.length
    Object.values(project.cells).forEach((cell) => {
      if (
        cell.text.trim()
        || cell.note.trim()
        || cell.select
        || cell.score !== null
        || cell.numeric !== null
      ) {
        filled += 1
      }
    })
  })

  return total ? Math.round((filled / total) * 100) : 0
}
