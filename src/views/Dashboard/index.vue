<script setup lang="ts">
import {
  ArrowRight,
  FilePlus2,
  FolderPlus,
  LayoutDashboard,
  Sparkles,
  Star,
} from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { RouterPath } from '@/constants/route-path'
import { useDecisionWorkspaceStore } from '@/store/decision-workspace'

const workspaceStore = useDecisionWorkspaceStore()
const router = useRouter()
const { filteredProjects, folders, selectedFolderId, templates } = storeToRefs(workspaceStore)
const TEMPLATE_EMPTY_VALUE = '__template-empty__'

const newProjectTitle = ref('')
const newProjectDescription = ref('')
const selectedTemplateId = ref('')
const newFolderName = ref('')

const templateGroups = computed(() => ({
  official: templates.value.filter(template => template.isOfficial),
  personal: templates.value.filter(template => !template.isOfficial),
}))

onMounted(() => {
  void workspaceStore.ensureLoaded()
})

function formatDate(value?: string) {
  if (!value)
    return '刚刚更新'

  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

async function openProject(projectId: string) {
  await workspaceStore.selectProject(projectId)
  router.push(`${RouterPath.PROJECTS}/${projectId}`)
}

async function createFolder() {
  const name = newFolderName.value.trim()
  if (!name) {
    toast.error('先写一个文件夹名称')
    return
  }

  const folder = await workspaceStore.createFolder(name)
  if (!folder) {
    toast.error('鏂囦欢澶瑰垱寤哄け璐?')
    return
  }
  newFolderName.value = ''
  toast.success('文件夹已经创建')
}

async function createProject() {
  const project = await workspaceStore.createProject({
    title: newProjectTitle.value.trim() || undefined,
    description: newProjectDescription.value.trim() || undefined,
    folderId: selectedFolderId.value === 'all' || selectedFolderId.value === 'ungrouped' ? null : selectedFolderId.value,
    templateId: selectedTemplateId.value || null,
  })

  if (!project) {
    toast.error('椤圭洰鍒涘缓澶辫触')
    return
  }

  newProjectTitle.value = ''
  newProjectDescription.value = ''
  selectedTemplateId.value = ''
  toast.success('项目已经创建，正在进入详情页')

  if (!project) {
    toast.error('妯℃澘搴旂敤澶辫触')
    return
  }

  {
    router.push(`${RouterPath.PROJECTS}/${project.id}`)
  }
}

function updateSelectedTemplate(value: unknown) {
  selectedTemplateId.value = typeof value === 'string' && value !== TEMPLATE_EMPTY_VALUE ? value : ''
}

async function applyTemplate(templateId: string) {
  const project = await workspaceStore.createProject({
    title: undefined,
    description: undefined,
    folderId: null,
    templateId,
  })
  if (project) {
    toast.success('模板已应用，正在进入项目页')
    router.push(`${RouterPath.PROJECTS}/${project.id}`)
  }
}
</script>

<template>
  <section class="grid gap-5">
    <header class="flex flex-col gap-2 px-1 py-1 sm:flex-row sm:items-end sm:justify-between">
      <div class="grid gap-1.5">
        <div class="inline-flex w-fit items-center gap-2 text-[0.68rem] font-semibold tracking-[0.2em] text-slate-400 uppercase">
          <LayoutDashboard class="size-3.5 text-slate-500" />
          Workspace
        </div>
        <h1 class="font-display text-[1.55rem] font-semibold tracking-[-0.05em] text-slate-950 sm:text-[1.8rem]">
          决策工作台
        </h1>
        <p class="max-w-2xl text-sm leading-6 text-slate-500">
          管理项目、文件夹和模板，具体决策内容进入项目页继续编辑。
        </p>
      </div>
    </header>

    <div class="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)_360px]">
      <aside class="grid gap-5 self-start xl:sticky xl:top-4">
        <UiCard class="rounded-[28px] border border-white/75 bg-white/74 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-[18px]">
          <UiCardHeader class="gap-4 p-5">
            <div>
              <UiCardTitle class="text-xl font-semibold tracking-[-0.04em] text-slate-950">
                文件夹
              </UiCardTitle>
              <UiCardDescription class="mt-1 text-sm leading-6 text-slate-500">
                先把决策按主题收拢，再进入具体项目编辑。
              </UiCardDescription>
            </div>

            <div class="grid gap-2">
              <button
                type="button"
                class="flex items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition"
                :class="selectedFolderId === 'all' ? 'bg-slate-950 text-white shadow-[0_14px_30px_rgba(15,23,42,0.16)]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                @click="workspaceStore.selectFolder('all')"
              >
                <span>全部项目</span>
                <span class="text-xs opacity-70">{{ workspaceStore.projects.length }}</span>
              </button>
              <button
                type="button"
                class="flex items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition"
                :class="selectedFolderId === 'ungrouped' ? 'bg-slate-950 text-white shadow-[0_14px_30px_rgba(15,23,42,0.16)]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                @click="workspaceStore.selectFolder('ungrouped')"
              >
                <span>未归档</span>
                <span class="text-xs opacity-70">{{ workspaceStore.projects.filter(project => !project.folderId).length }}</span>
              </button>
              <button
                v-for="folder in folders"
                :key="folder.id"
                type="button"
                class="flex items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition"
                :class="selectedFolderId === folder.id ? 'bg-slate-950 text-white shadow-[0_14px_30px_rgba(15,23,42,0.16)]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                @click="workspaceStore.selectFolder(folder.id)"
              >
                <span class="flex items-center gap-2">
                  <span class="size-2.5 rounded-full" :class="folder.accent" />
                  {{ folder.name }}
                </span>
                <span class="text-xs opacity-70">{{ workspaceStore.projects.filter(project => project.folderId === folder.id).length }}</span>
              </button>
            </div>

            <div class="grid gap-2 rounded-[22px] border border-slate-200 bg-slate-50/90 p-3">
              <label class="text-xs font-semibold tracking-[0.16em] uppercase text-slate-500">新增文件夹</label>
              <input
                v-model="newFolderName"
                type="text"
                class="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none ring-0"
                placeholder="比如：搬家、购机、Offer"
              >
              <UiButton type="button" class="h-11 rounded-2xl bg-slate-950 text-white" @click="createFolder">
                <FolderPlus class="mr-2 size-4" />
                创建文件夹
              </UiButton>
            </div>
          </UiCardHeader>
        </UiCard>

        <UiCard class="rounded-[28px] border border-white/75 bg-white/74 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-[18px]">
          <UiCardHeader class="gap-4 p-5">
            <div>
              <UiCardTitle class="text-xl font-semibold tracking-[-0.04em] text-slate-950">
                快速新建
              </UiCardTitle>
              <UiCardDescription class="mt-1 text-sm leading-6 text-slate-500">
                从空白开始，或者先用模板打开第一版结构。
              </UiCardDescription>
            </div>

            <div class="grid gap-3">
              <input
                v-model="newProjectTitle"
                type="text"
                class="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none"
                placeholder="项目名称，比如：毕业租房选择"
              >
              <textarea
                v-model="newProjectDescription"
                rows="3"
                class="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-900 outline-none"
                placeholder="一句话写清楚这次决策的目标和约束。"
              />
              <UiSelect
                :model-value="selectedTemplateId || TEMPLATE_EMPTY_VALUE"
                @update:model-value="updateSelectedTemplate"
              >
                <UiSelectTrigger class="h-11 rounded-2xl border-slate-200 bg-slate-50 text-sm text-slate-900">
                  <UiSelectValue placeholder="从空白项目开始" />
                </UiSelectTrigger>
                <UiSelectContent>
                  <UiSelectItem :value="TEMPLATE_EMPTY_VALUE">
                    从空白项目开始
                  </UiSelectItem>
                  <UiSelectItem
                    v-for="template in templateGroups.official"
                    :key="template.id"
                    :value="template.id"
                  >
                    {{ template.name }} · {{ template.category }}
                  </UiSelectItem>
                  <UiSelectItem
                    v-for="template in templateGroups.personal"
                    :key="template.id"
                    :value="template.id"
                  >
                    {{ template.name }} · 我的模板
                  </UiSelectItem>
                </UiSelectContent>
              </UiSelect>
              <UiButton type="button" class="h-11 rounded-2xl bg-teal-700 text-white hover:bg-teal-600" @click="createProject">
                <FilePlus2 class="mr-2 size-4" />
                创建并进入项目
              </UiButton>
            </div>
          </UiCardHeader>
        </UiCard>
      </aside>

      <main class="grid gap-5">
        <UiCard class="rounded-[30px] border border-white/75 bg-white/76 shadow-[0_24px_75px_rgba(15,23,42,0.08)] backdrop-blur-[18px]">
          <UiCardHeader class="gap-4 p-5">
            <div class="flex items-center justify-between gap-3">
              <div>
                <UiCardTitle class="text-xl font-semibold tracking-[-0.04em] text-slate-950">
                  项目列表
                </UiCardTitle>
                <UiCardDescription class="mt-1 text-sm leading-6 text-slate-500">
                  默认按重点项目优先、最近更新时间排序。点击任意卡片进入项目详情页。
                </UiCardDescription>
              </div>
            </div>

            <div class="grid gap-4 lg:grid-cols-2">
              <button
                v-for="project in filteredProjects"
                :key="project.id"
                type="button"
                class="group rounded-[28px] border border-slate-200 bg-white p-5 text-left shadow-[0_18px_40px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_22px_50px_rgba(15,23,42,0.08)]"
                @click="openProject(project.id)"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <div class="flex items-center gap-2">
                      <Star v-if="project.isFavorite" class="size-4 fill-amber-400 text-amber-400" />
                      <p class="truncate text-lg font-semibold tracking-[-0.03em] text-slate-950">
                        {{ project.title }}
                      </p>
                    </div>
                    <p class="mt-2 text-sm leading-7 text-slate-600">
                      {{ project.description }}
                    </p>
                  </div>
                  <span class="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                    {{ formatDate(project.updatedAt) }}
                  </span>
                </div>

                <div class="mt-4 flex flex-wrap gap-2 text-[11px]">
                  <span class="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                    {{ project.rows.length }} 个选项
                  </span>
                  <span class="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                    {{ project.columns.length }} 个维度
                  </span>
                  <span class="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                    {{ folders.find(folder => folder.id === project.folderId)?.name ?? '未归档' }}
                  </span>
                </div>

                <div class="mt-5 flex items-center justify-between">
                  <p class="text-xs font-semibold tracking-[0.16em] uppercase text-slate-500">
                    正式产品逻辑
                  </p>
                  <span class="inline-flex items-center gap-1 text-sm font-medium text-slate-900">
                    进入项目页
                    <ArrowRight class="size-4 transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </button>
            </div>
          </UiCardHeader>
        </UiCard>
      </main>

      <aside class="grid gap-5 self-start xl:sticky xl:top-4">
        <UiCard class="rounded-[28px] border border-white/75 bg-white/74 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-[18px]">
          <UiCardHeader class="gap-4 p-5">
            <div class="flex items-center gap-2">
              <Sparkles class="size-5 text-teal-700" />
              <div>
                <UiCardTitle class="text-xl font-semibold tracking-[-0.04em] text-slate-950">
                  官方模板
                </UiCardTitle>
                <UiCardDescription class="mt-1 text-sm leading-6 text-slate-500">
                  更适合作为工作台入口，不建议直接和项目内容混编在同一页。
                </UiCardDescription>
              </div>
            </div>

            <div class="grid gap-3">
              <div
                v-for="template in templateGroups.official"
                :key="template.id"
                class="rounded-[24px] border border-slate-200 bg-slate-50 p-4"
              >
                <div class="rounded-[18px] bg-gradient-to-br px-4 py-4" :class="template.accent">
                  <p class="text-sm font-semibold text-slate-900">
                    {{ template.name }}
                  </p>
                  <p class="mt-2 text-xs leading-6 text-slate-700">
                    {{ template.description }}
                  </p>
                </div>
                <div class="mt-3 flex items-center justify-between gap-3">
                  <span class="text-xs font-semibold tracking-[0.16em] uppercase text-slate-500">{{ template.category }}</span>
                  <UiButton type="button" class="h-9 rounded-2xl bg-slate-950 px-4 text-white" @click="applyTemplate(template.id)">
                    套用
                  </UiButton>
                </div>
              </div>
            </div>
          </UiCardHeader>
        </UiCard>

        <UiCard v-if="templateGroups.personal.length" class="rounded-[28px] border border-white/75 bg-white/74 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-[18px]">
          <UiCardHeader class="gap-4 p-5">
            <div>
              <UiCardTitle class="text-xl font-semibold tracking-[-0.04em] text-slate-950">
                个人模板
              </UiCardTitle>
              <UiCardDescription class="mt-1 text-sm leading-6 text-slate-500">
                从项目页沉淀下来的结构，会回到这里统一管理。
              </UiCardDescription>
            </div>

            <div class="grid gap-3">
              <button
                v-for="template in templateGroups.personal"
                :key="template.id"
                type="button"
                class="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-slate-300 hover:bg-white"
                @click="applyTemplate(template.id)"
              >
                <p class="text-sm font-semibold text-slate-900">
                  {{ template.name }}
                </p>
                <p class="mt-1 text-xs leading-6 text-slate-500">
                  {{ template.description }}
                </p>
              </button>
            </div>
          </UiCardHeader>
        </UiCard>
      </aside>
    </div>
  </section>
</template>
