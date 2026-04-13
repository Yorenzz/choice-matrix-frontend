<script setup lang="ts">
import {
  ArrowLeft,
  Bot,
  Brain,
  Copy,
  Download,
  Plus,
  Share2,
  Sparkles,
  Star,
  Trash2,
  X,
} from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { RouterPath } from '@/constants/route-path'
import {
  type DecisionCell,
  type DecisionColumn,
  type DecisionColumnType,
  type DecisionProject,
  type DecisionRow,
  useDecisionWorkspaceStore,
} from '@/store/decision-workspace'

interface CellEditorState {
  rowId: string
  columnId: string
}

function escapeCsv(value: string) {
  return value.split('"').join('""')
}

const workspaceStore = useDecisionWorkspaceStore()
const { currentProject, folders } = storeToRefs(workspaceStore)
const route = useRoute()
const router = useRouter()
const SELECT_EMPTY_VALUE = '__select-empty__'

const projectTitleDraft = ref('')
const projectDescriptionDraft = ref('')
const projectFocusPrompt = ref('')
const personalTemplateName = ref('')
const selectedNewColumnType = ref<DecisionColumnType>('score')
const activeCellEditor = ref<CellEditorState | null>(null)
const selectOptionDrafts = ref<Record<string, string>>({})
const columnTypeLabelMap: Record<DecisionColumnType, string> = {
  score: '评分',
  numeric: '数值',
  select: '选择',
  text: '信息',
}

async function syncRouteProject(projectId: string | string[] | undefined) {
  const id = Array.isArray(projectId) ? projectId[0] : projectId
  if (!id)
    return

  await workspaceStore.ensureLoaded()

  const exists = workspaceStore.projects.find(project => project.id === id)
  if (!exists) {
    toast.error('这个项目不存在，已返回工作台')
    router.replace(RouterPath.DASHBOARD)
    return
  }

  await workspaceStore.selectProject(id)
}

watch(() => route.params.id, syncRouteProject, { immediate: true })

watch(currentProject, (project) => {
  projectTitleDraft.value = project?.title ?? ''
  projectDescriptionDraft.value = project?.description ?? ''
  projectFocusPrompt.value = project?.aiSummary?.focusPrompt ?? ''
  personalTemplateName.value = project ? `${project.title} 模板` : ''
}, { immediate: true })

const currentRanking = computed(() => {
  if (!currentProject.value)
    return []
  return workspaceStore.getProjectRanking(currentProject.value.id)
})

const currentFolderName = computed(() => {
  if (!currentProject.value?.folderId)
    return '未归档'
  return folders.value.find(folder => folder.id === currentProject.value?.folderId)?.name ?? '未归档'
})

const currentProjectCompletion = computed(() => {
  const project = currentProject.value
  if (!project)
    return { filled: 0, total: 0, ratio: 0 }

  const total = project.rows.length * project.columns.length
  let filled = 0

  project.rows.forEach((row) => {
    project.columns.forEach((column) => {
      const cell = workspaceStore.getProjectCell(project.id, row.id, column.id)
      if (cell.text.trim() || cell.note.trim() || cell.select || cell.score !== null || cell.numeric !== null) {
        filled += 1
      }
    })
  })

  return {
    filled,
    total,
    ratio: total ? Math.round((filled / total) * 100) : 0,
  }
})

const matrixGridColumns = computed(() => {
  const project = currentProject.value
  return `280px repeat(${project?.columns.length ?? 1}, minmax(180px, 1fr)) 132px`
})

const activeEditorRow = computed<DecisionRow | null>(() => {
  if (!currentProject.value || !activeCellEditor.value)
    return null
  return currentProject.value.rows.find(row => row.id === activeCellEditor.value?.rowId) ?? null
})

const activeEditorColumn = computed<DecisionColumn | null>(() => {
  if (!currentProject.value || !activeCellEditor.value)
    return null
  return currentProject.value.columns.find(column => column.id === activeCellEditor.value?.columnId) ?? null
})

const activeEditorCell = computed<DecisionCell | null>(() => {
  if (!currentProject.value || !activeCellEditor.value)
    return null
  return workspaceStore.getProjectCell(currentProject.value.id, activeCellEditor.value.rowId, activeCellEditor.value.columnId)
})

function syncProjectMeta() {
  if (!currentProject.value)
    return

  workspaceStore.updateProjectMeta(currentProject.value.id, {
    title: projectTitleDraft.value.trim() || '新的决策项目',
    description: projectDescriptionDraft.value.trim(),
  })
}

function updateColumn(project: DecisionProject, column: DecisionColumn, patch: Partial<DecisionColumn>) {
  workspaceStore.updateColumn(project.id, column.id, patch)
}

function updateCell(projectId: string, rowId: string, columnId: string, patch: Partial<DecisionCell>) {
  workspaceStore.updateCell(projectId, rowId, columnId, patch)
}

function normalizeOptions(values: string[]) {
  return Array.from(new Set(values.map(value => value.trim()).filter(Boolean)))
}

function getColumnTypeLabel(type: DecisionColumnType) {
  return columnTypeLabelMap[type]
}

function getColumnTypeSummary(column: DecisionColumn) {
  if (column.type === 'score')
    return `评分维度 · 权重 ${column.weight}`
  if (column.type === 'numeric')
    return `数值维度${column.unit ? ` · ${column.unit}` : ''}`
  if (column.type === 'select')
    return '选择维度'
  return '信息维度'
}

function updateSelectOptionDraft(columnId: string, value: string) {
  selectOptionDrafts.value = {
    ...selectOptionDrafts.value,
    [columnId]: value,
  }
}

function addSelectOptions(project: DecisionProject, column: DecisionColumn) {
  const draft = selectOptionDrafts.value[column.id] ?? ''
  const additions = normalizeOptions(draft.split(/[\n,，]/g))
  if (!additions.length)
    return

  updateColumn(project, column, {
    options: normalizeOptions([...column.options, ...additions]),
  })

  updateSelectOptionDraft(column.id, '')
}

function removeSelectOption(project: DecisionProject, column: DecisionColumn, option: string) {
  updateColumn(project, column, {
    options: column.options.filter(item => item !== option),
  })
}

function updateActiveSelectValue(value: unknown) {
  if (!currentProject.value || !activeEditorRow.value || !activeEditorColumn.value)
    return

  updateCell(currentProject.value.id, activeEditorRow.value.id, activeEditorColumn.value.id, {
    select: typeof value === 'string' && value && value !== SELECT_EMPTY_VALUE ? value : null,
  })
}

function openCellEditor(rowId: string, columnId: string) {
  activeCellEditor.value = { rowId, columnId }
}

function closeCellEditor() {
  activeCellEditor.value = null
}

function addColumn(type = selectedNewColumnType.value) {
  if (!currentProject.value)
    return

  workspaceStore.addColumn(currentProject.value.id, {
    type,
    title: type === 'numeric'
      ? '新的数值维度'
      : type === 'text'
        ? '新的信息维度'
        : type === 'select'
          ? '新的选择维度'
          : '新的评分维度',
  })
}

function summarizeCell(projectId: string, rowId: string, column: DecisionColumn) {
  const cell = workspaceStore.getProjectCell(projectId, rowId, column.id)

  if (column.type === 'score') {
    return {
      headline: cell.score === null ? '未评分' : `${cell.score.toFixed(0)} 分`,
      subline: cell.note.trim() || '点击补充打分理由',
      tone: cell.score === null ? 'text-slate-400' : 'text-slate-950',
    }
  }

  if (column.type === 'numeric') {
    return {
      headline: cell.numeric === null ? '--' : `${cell.numeric}${column.unit || ''}`,
      subline: column.unit ? `单位：${column.unit}` : '点击填写数值',
      tone: cell.numeric === null ? 'text-slate-400' : 'text-slate-950',
    }
  }

  if (column.type === 'select') {
    return {
      headline: cell.select || '未选择',
      subline: column.options.length ? `${column.options.length} 个可选项` : '点击配置候选项',
      tone: cell.select ? 'text-slate-950' : 'text-slate-400',
    }
  }

  const text = cell.text.trim()
  return {
    headline: text ? text.slice(0, 24) : '空白',
    subline: text ? (text.length > 24 ? `${text.slice(24, 52)}...` : '已填写') : '点击补充说明',
    tone: text ? 'text-slate-950' : 'text-slate-400',
  }
}

function generateSummary() {
  if (!currentProject.value)
    return

  const summary = workspaceStore.generateSummary(currentProject.value.id, projectFocusPrompt.value.trim())
  if (!summary) {
    toast.error('当前项目暂时无法生成摘要')
    return
  }

  toast.success('AI 摘要已基于当前数据重新整理')
}

function saveAsTemplate() {
  if (!currentProject.value)
    return

  const name = personalTemplateName.value.trim()
  if (!name) {
    toast.error('模板名称不能为空')
    return
  }

  workspaceStore.saveAsTemplate(currentProject.value.id, name)
  toast.success('当前结构已保存为个人模板')
}

async function copyShareLink() {
  if (!currentProject.value)
    return

  const token = currentProject.value.shareToken || await workspaceStore.createShareLink(currentProject.value.id)
  if (!token) {
    toast.error('暂时无法生成分享链接')
    return
  }

  const link = `https://choice-matrix.local/share/${token}`

  try {
    await navigator.clipboard.writeText(link)
    toast.success('分享链接已复制到剪贴板')
  }
  catch {
    toast.success(`已生成分享链接：${link}`)
  }
}

function exportCsv() {
  if (!currentProject.value)
    return

  const project = currentProject.value
  const rows = [['选项', ...project.columns.map(column => column.title), '总分', '排名'].join(',')]
  const rankingMap = new Map(currentRanking.value.map(item => [item.rowId, item]))

  project.rows.forEach((row) => {
    const values = project.columns.map((column) => {
      const cell = workspaceStore.getProjectCell(project.id, row.id, column.id)
      const raw = column.type === 'numeric'
        ? cell.numeric ?? ''
        : column.type === 'score'
          ? `${cell.score ?? ''} ${cell.note || ''}`.trim()
          : column.type === 'select'
            ? cell.select ?? ''
            : cell.text
      return `"${escapeCsv(String(raw))}"`
    })

    const rowScore = rankingMap.get(row.id)
    rows.push([
      `"${escapeCsv(row.title)}"`,
      ...values,
      rowScore?.total ?? '待完善',
      rowScore?.rank ?? '-',
    ].join(','))
  })

  const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${project.title}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
  toast.success('CSV 已导出到本地')
}

function exportSnapshot() {
  toast.success('图片导出入口已保留，后续可接真实导出能力。')
}

async function removeCurrentProject() {
  if (!currentProject.value)
    return

  await workspaceStore.deleteProject(currentProject.value.id)
  toast.success('项目已删除，已返回工作台')
  router.push(RouterPath.DASHBOARD)
}

function backToWorkspace() {
  router.push(RouterPath.DASHBOARD)
}
</script>

<template>
  <section v-if="currentProject" class="grid gap-5">
    <header class="rounded-[28px] border border-white/75 bg-white/72 px-5 py-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-[20px]">
      <div class="grid gap-4">
        <div class="flex flex-wrap items-center gap-2">
          <UiButton
            variant="outline"
            class="h-9 rounded-2xl border-slate-200 bg-white/90 px-3.5 text-slate-700"
            @click="backToWorkspace"
          >
            <ArrowLeft class="mr-2 size-4" />
            返回工作台
          </UiButton>
          <span class="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold tracking-[0.2em] text-white uppercase">
            项目详情
          </span>
          <span class="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold tracking-[0.16em] text-slate-600 uppercase">
            {{ currentFolderName }}
          </span>
        </div>

        <div class="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_auto] xl:items-center">
          <div class="flex flex-wrap items-center gap-2">
            <input
              v-model="projectTitleDraft"
              type="text"
              class="w-full border-none bg-transparent p-0 font-display text-[1.5rem] font-semibold tracking-[-0.05em] text-slate-950 outline-none sm:text-[1.8rem]"
              placeholder="项目标题"
              @blur="syncProjectMeta"
            >
          </div>

          <div class="rounded-[20px] border border-slate-200 bg-slate-50/90 px-4 py-3">
            <textarea
              v-model="projectDescriptionDraft"
              rows="2"
              class="w-full resize-none border-none bg-transparent p-0 text-sm leading-6 text-slate-700 outline-none"
              placeholder="一句话写清楚这次比较的目标、场景与约束。"
              @blur="syncProjectMeta"
            />
          </div>

          <div class="grid gap-2 sm:grid-cols-2 xl:w-[320px]">
            <UiButton variant="outline" class="h-10 rounded-2xl border-slate-200 bg-white/90 px-4 text-slate-700" @click="workspaceStore.toggleFavorite(currentProject.id)">
              <Star class="mr-2 size-4" :class="currentProject.isFavorite ? 'fill-amber-400 text-amber-400' : ''" />
              {{ currentProject.isFavorite ? '取消重点' : '设为重点项目' }}
            </UiButton>
            <UiButton type="button" class="h-10 rounded-2xl bg-slate-950 px-4 text-white" @click="copyShareLink">
              <Share2 class="mr-2 size-4" />
              生成分享链接
            </UiButton>
            <UiButton variant="outline" class="h-10 rounded-2xl border-slate-200 bg-white/90 px-4 text-slate-700" @click="workspaceStore.duplicateProject(currentProject.id)">
              <Copy class="mr-2 size-4" />
              复制项目
            </UiButton>
            <UiButton variant="outline" class="h-10 rounded-2xl border-rose-200 bg-rose-50 px-4 text-rose-700 hover:bg-rose-100" @click="removeCurrentProject">
              <Trash2 class="mr-2 size-4" />
              删除项目
            </UiButton>
          </div>
        </div>
      </div>
    </header>

    <div class="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <main class="grid content-start gap-5 self-start">
        <UiCard class="rounded-[30px] border border-white/75 bg-white/76 shadow-[0_24px_75px_rgba(15,23,42,0.08)] backdrop-blur-[18px]">
          <UiCardHeader class="gap-4 p-5">
            <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <UiCardTitle class="text-xl font-semibold tracking-[-0.04em] text-slate-950">
                  矩阵设置
                </UiCardTitle>
                <UiCardDescription class="mt-1 text-sm leading-6 text-slate-500">
                  把结构操作和维度配置放在同一层，先调整框架，再去下方矩阵录入内容。
                </UiCardDescription>
              </div>
              <div class="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-600">
                当前完成度 <span class="font-semibold text-slate-950">{{ currentProjectCompletion.ratio }}%</span>
                ，已填写 {{ currentProjectCompletion.filled }}/{{ currentProjectCompletion.total }} 个单元格。
              </div>
            </div>

            <div class="grid gap-4">
              <div class="rounded-[24px] border border-slate-200 bg-slate-50/90 p-4">
                <div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div class="min-w-0">
                    <p class="text-xs font-semibold tracking-[0.16em] uppercase text-slate-500">
                      结构操作
                    </p>
                    <p class="mt-1 text-sm leading-6 text-slate-600">
                      先调整矩阵结构，再去下方录入和比较内容。
                    </p>
                  </div>

                  <div class="flex flex-wrap items-center gap-2">
                    <UiButton type="button" class="h-9 rounded-2xl bg-teal-700 px-3 text-white hover:bg-teal-600" @click="workspaceStore.addRow(currentProject.id)">
                      <Plus class="mr-2 size-4" />
                      新增选项
                    </UiButton>

                    <UiSelect v-model:model-value="selectedNewColumnType">
                      <UiSelectTrigger class="h-9 min-w-[180px] rounded-2xl border-slate-200 bg-white text-sm text-slate-900">
                        <UiSelectValue placeholder="选择维度类型" />
                      </UiSelectTrigger>
                      <UiSelectContent>
                        <UiSelectItem value="score">
                          评分维度
                        </UiSelectItem>
                        <UiSelectItem value="numeric">
                          数值维度
                        </UiSelectItem>
                        <UiSelectItem value="text">
                          信息维度
                        </UiSelectItem>
                        <UiSelectItem value="select">
                          选择维度
                        </UiSelectItem>
                      </UiSelectContent>
                    </UiSelect>

                    <UiButton type="button" variant="outline" class="h-9 rounded-2xl border-slate-200 bg-white px-3 text-slate-700" @click="addColumn()">
                      <Plus class="mr-2 size-4" />
                      新增维度
                    </UiButton>
                  </div>
                </div>

                <div class="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                  <span class="rounded-full bg-white px-3 py-1.5">
                    {{ currentProject.rows.length }} 个选项
                  </span>
                  <span class="rounded-full bg-white px-3 py-1.5">
                    {{ currentProject.columns.length }} 个维度
                  </span>
                  <span class="rounded-full bg-white px-3 py-1.5">
                    {{ currentProject.columns.filter(column => column.type === 'score').length }} 个评分维度
                  </span>
                </div>
              </div>

              <div class="grid gap-3">
                <div>
                  <p class="text-xs font-semibold tracking-[0.16em] uppercase text-slate-500">
                    维度配置
                  </p>
                  <p class="mt-1 text-sm leading-6 text-slate-600">
                    这里只处理列名、权重、单位和候选项，不再单独跳出第二张重卡片。
                  </p>
                </div>

                <div class="grid items-start gap-3 md:grid-cols-2 2xl:grid-cols-3">
                  <div
                    v-for="column in currentProject.columns"
                    :key="column.id"
                    class="grid self-start gap-3 rounded-[22px] border border-slate-200 bg-white px-4 py-4"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0 flex-1">
                        <div class="flex flex-wrap items-center gap-2">
                          <input
                            :value="column.title"
                            type="text"
                            class="min-w-0 flex-1 border-none bg-transparent p-0 text-base font-semibold text-slate-900 outline-none"
                            @input="updateColumn(currentProject, column, { title: ($event.target as HTMLInputElement).value })"
                          >
                          <span class="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase text-slate-500">
                            {{ getColumnTypeLabel(column.type) }}
                          </span>
                        </div>
                      </div>

                      <UiButton
                        type="button"
                        variant="ghost"
                        class="h-9 w-9 rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-rose-500"
                        @click="workspaceStore.removeColumn(currentProject.id, column.id)"
                      >
                        <Trash2 class="size-4" />
                      </UiButton>
                    </div>

                    <div v-if="column.type === 'score'" class="grid gap-2">
                      <div class="flex items-center justify-between gap-3">
                        <span class="text-xs font-semibold tracking-[0.16em] uppercase text-slate-500">权重</span>
                        <span class="inline-flex min-w-10 items-center justify-center rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                          {{ column.weight }}
                        </span>
                      </div>
                      <input
                        :value="column.weight"
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        class="h-2 w-full accent-teal-700"
                        @input="updateColumn(currentProject, column, { weight: Number(($event.target as HTMLInputElement).value) })"
                      >
                    </div>

                    <div v-else-if="column.type === 'numeric'" class="grid gap-2">
                      <span class="text-xs font-semibold tracking-[0.16em] uppercase text-slate-500">单位</span>
                      <input
                        :value="column.unit"
                        type="text"
                        class="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none"
                        placeholder="元 / 分钟 / 平方米"
                        @input="updateColumn(currentProject, column, { unit: ($event.target as HTMLInputElement).value })"
                      >
                    </div>

                    <div v-else-if="column.type === 'select'" class="grid gap-2">
                      <span class="text-xs font-semibold tracking-[0.16em] uppercase text-slate-500">候选项</span>
                      <div class="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                        <div v-if="column.options.length" class="flex flex-wrap gap-2">
                          <span
                            v-for="option in column.options"
                            :key="option"
                            class="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.18)]"
                          >
                            {{ option }}
                            <button
                              type="button"
                              class="inline-flex size-4 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                              @click="removeSelectOption(currentProject, column, option)"
                            >
                              <X class="size-3" />
                            </button>
                          </span>
                        </div>
                        <div v-else class="rounded-2xl border border-dashed border-slate-200 bg-white/80 px-3 py-3 text-sm leading-6 text-slate-400">
                          还没有候选项，先加几个常用选项。
                        </div>

                        <div class="flex items-center gap-2">
                          <input
                            :value="selectOptionDrafts[column.id] ?? ''"
                            type="text"
                            class="h-10 flex-1 rounded-2xl border border-white bg-white px-3 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400"
                            placeholder="输入候选项，回车添加"
                            @input="updateSelectOptionDraft(column.id, ($event.target as HTMLInputElement).value)"
                            @keydown.enter.prevent="addSelectOptions(currentProject, column)"
                            @blur="addSelectOptions(currentProject, column)"
                          >
                          <UiButton
                            type="button"
                            variant="outline"
                            class="h-10 rounded-2xl border-slate-200 bg-white px-3 text-slate-700"
                            @click="addSelectOptions(currentProject, column)"
                          >
                            <Plus class="mr-1.5 size-4" />
                            添加
                          </UiButton>
                        </div>
                        <p class="text-xs leading-5 text-slate-500">
                          支持用回车或逗号连续添加，删除时直接点候选项上的关闭按钮。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </UiCardHeader>
        </UiCard>

        <UiCard class="rounded-[30px] border border-white/75 bg-white/76 shadow-[0_24px_75px_rgba(15,23,42,0.08)] backdrop-blur-[18px]">
          <UiCardHeader class="gap-4 p-5">
            <div class="flex items-center justify-between gap-3">
              <div>
                <UiCardTitle class="text-xl font-semibold tracking-[-0.04em] text-slate-950">
                  决策矩阵
                </UiCardTitle>
                <UiCardDescription class="mt-1 text-sm leading-6 text-slate-500">
                  现在改成“轻表格 + 右侧编辑抽屉”。主视图负责快速比较，编辑动作放到侧边完成。
                </UiCardDescription>
              </div>
              <span class="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold tracking-[0.16em] text-slate-600 uppercase">
                概览模式
              </span>
            </div>

            <div class="overflow-x-auto rounded-[26px] border border-slate-200 bg-white">
              <div class="min-w-max" :style="{ display: 'grid', gridTemplateColumns: matrixGridColumns }">
                <div class="sticky left-0 z-20 border-r border-b border-slate-200 bg-slate-50/95 px-5 py-4 backdrop-blur">
                  <p class="text-xs font-semibold tracking-[0.16em] uppercase text-slate-500">选项</p>
                  <p class="mt-2 text-sm leading-6 text-slate-600">
                    保持连续表格结构，先对比，再点击单元格深入编辑。
                  </p>
                </div>
                <div
                  v-for="column in currentProject.columns"
                  :key="column.id"
                  class="border-r border-b border-slate-200 bg-slate-50 px-4 py-4 last:border-r-0"
                >
                  <p class="text-sm font-semibold text-slate-900">
                    {{ column.title }}
                  </p>
                  <p class="mt-1 text-xs leading-6 text-slate-500">
                    {{ getColumnTypeSummary(column) }}
                  </p>
                </div>
                <div class="border-b border-slate-200 bg-slate-50 px-4 py-4">
                  <p class="text-xs font-semibold tracking-[0.16em] uppercase text-slate-500">总分</p>
                  <p class="mt-2 text-sm leading-6 text-slate-600">
                    按评分列自动生成排名
                  </p>
                </div>

                <template v-for="row in currentProject.rows" :key="row.id">
                  <div class="sticky left-0 z-10 border-r border-b border-slate-200 bg-white px-5 py-4 backdrop-blur">
                    <input
                      :value="row.title"
                      type="text"
                      class="w-full border-none bg-transparent p-0 text-base font-semibold text-slate-900 outline-none"
                      @input="workspaceStore.updateRow(currentProject.id, row.id, { title: ($event.target as HTMLInputElement).value })"
                    >
                    <textarea
                      :value="row.subtitle"
                      rows="2"
                      class="mt-2 w-full border-none bg-transparent p-0 text-sm leading-6 text-slate-500 outline-none"
                      placeholder="补一句这个方案的关键定位"
                      @input="workspaceStore.updateRow(currentProject.id, row.id, { subtitle: ($event.target as HTMLTextAreaElement).value })"
                    />
                  </div>

                  <button
                    v-for="column in currentProject.columns"
                    :key="column.id"
                    type="button"
                    class="group border-r border-b border-slate-200 px-4 py-4 text-left transition hover:bg-slate-50 last:border-r-0"
                    @click="openCellEditor(row.id, column.id)"
                  >
                    <div class="grid gap-2">
                      <p class="text-sm font-semibold" :class="summarizeCell(currentProject.id, row.id, column).tone">
                        {{ summarizeCell(currentProject.id, row.id, column).headline }}
                      </p>
                      <p class="min-h-[2.75rem] text-xs leading-5 text-slate-500">
                        {{ summarizeCell(currentProject.id, row.id, column).subline }}
                      </p>
                      <span class="inline-flex w-fit items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 transition group-hover:bg-slate-900 group-hover:text-white">
                        点击编辑
                      </span>
                    </div>
                  </button>

                  <div class="border-b border-slate-200 bg-slate-50/70 px-4 py-4">
                    <template v-if="currentRanking.find(item => item.rowId === row.id)?.total !== null">
                      <p class="font-display text-[1.9rem] font-semibold tracking-[-0.05em] text-slate-950">
                        {{ currentRanking.find(item => item.rowId === row.id)?.total }}
                      </p>
                      <p class="mt-1 text-xs font-semibold tracking-[0.16em] uppercase text-slate-500">
                        rank #{{ currentRanking.find(item => item.rowId === row.id)?.rank }}
                      </p>
                    </template>
                    <template v-else>
                      <p class="text-sm font-semibold text-slate-900">
                        待完善
                      </p>
                      <p class="mt-1 text-xs leading-5 text-slate-500">
                        缺少 {{ (currentRanking.find(item => item.rowId === row.id)?.required ?? 0) - (currentRanking.find(item => item.rowId === row.id)?.completed ?? 0) }} 个评分项
                      </p>
                    </template>
                  </div>
                </template>
              </div>
            </div>
          </UiCardHeader>
        </UiCard>
      </main>

      <aside class="grid gap-5 self-start xl:sticky xl:top-4">
        <UiCard class="rounded-[28px] border border-white/75 bg-white/74 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-[18px]">
          <UiCardHeader class="gap-4 p-5">
            <div>
              <UiCardTitle class="text-xl font-semibold tracking-[-0.04em] text-slate-950">
                当前项目状态
              </UiCardTitle>
              <UiCardDescription class="mt-1 text-sm leading-6 text-slate-500">
                用来快速判断这个项目距离“可以决策”还有多远。
              </UiCardDescription>
            </div>

            <div class="grid gap-3">
              <div class="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
                <p class="text-xs font-semibold tracking-[0.16em] uppercase text-slate-500">矩阵规模</p>
                <p class="mt-2 text-lg font-semibold text-slate-950">{{ currentProject.rows.length }} 个选项 · {{ currentProject.columns.length }} 个维度</p>
              </div>
              <div class="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
                <p class="text-xs font-semibold tracking-[0.16em] uppercase text-slate-500">排序状态</p>
                <p class="mt-2 text-lg font-semibold text-slate-950">{{ currentRanking.filter(item => item.total !== null).length }} 个方案已参与排名</p>
              </div>
              <div class="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
                <p class="text-xs font-semibold tracking-[0.16em] uppercase text-slate-500">本地保存</p>
                <p class="mt-2 text-lg font-semibold text-slate-950">已开启</p>
              </div>
            </div>
          </UiCardHeader>
        </UiCard>

        <UiCard class="rounded-[28px] border border-white/75 bg-white/74 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-[18px]">
          <UiCardHeader class="gap-4 p-5">
            <div class="flex items-center gap-2">
              <Brain class="size-5 text-teal-700" />
              <div>
                <UiCardTitle class="text-xl font-semibold tracking-[-0.04em] text-slate-950">
                  排名面板
                </UiCardTitle>
                <UiCardDescription class="mt-1 text-sm leading-6 text-slate-500">
                  评分列全部填写后，系统会自动参与加权排序。
                </UiCardDescription>
              </div>
            </div>

            <div class="grid gap-3">
              <div
                v-for="rank in currentRanking"
                :key="rank.rowId"
                class="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4"
              >
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="text-sm font-semibold text-slate-900">
                      {{ rank.rowTitle }}
                    </p>
                    <p class="mt-1 text-xs leading-6 text-slate-500">
                      {{ rank.total === null ? `已完成 ${rank.completed}/${rank.required} 个评分项` : `已完整填写 ${rank.required} 个评分项` }}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="font-display text-[1.65rem] font-semibold tracking-[-0.05em] text-slate-950">
                      {{ rank.total ?? '--' }}
                    </p>
                    <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      {{ rank.rank ? `#${rank.rank}` : '待完善' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </UiCardHeader>
        </UiCard>

        <UiCard class="rounded-[28px] border border-white/75 bg-white/74 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-[18px]">
          <UiCardHeader class="gap-4 p-5">
            <div class="flex items-center gap-2">
              <Bot class="size-5 text-sky-700" />
              <div>
                <UiCardTitle class="text-xl font-semibold tracking-[-0.04em] text-slate-950">
                  AI 决策助手
                </UiCardTitle>
                <UiCardDescription class="mt-1 text-sm leading-6 text-slate-500">
                  这一块放在项目页，围绕当前决策做收敛。
                </UiCardDescription>
              </div>
            </div>

            <div class="grid gap-3">
              <textarea
                v-model="projectFocusPrompt"
                rows="3"
                class="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-900 outline-none"
                placeholder="可选：告诉 AI 本次更想强调哪些维度，比如“重点看价格和续航”。"
              />
              <UiButton type="button" class="h-11 rounded-2xl bg-slate-950 text-white" @click="generateSummary">
                <Sparkles class="mr-2 size-4" />
                生成 AI 摘要
              </UiButton>
            </div>

            <div v-if="currentProject.aiSummary" class="grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50/90 p-4">
              <div>
                <p class="text-xs font-semibold tracking-[0.16em] uppercase text-slate-500">
                  综合评价
                </p>
                <p class="mt-2 text-sm leading-7 text-slate-700">
                  {{ currentProject.aiSummary.overview }}
                </p>
              </div>

              <div>
                <p class="text-xs font-semibold tracking-[0.16em] uppercase text-slate-500">
                  推荐建议
                </p>
                <p class="mt-2 text-sm leading-7 text-slate-700">
                  {{ currentProject.aiSummary.recommendation }}
                </p>
              </div>
            </div>
          </UiCardHeader>
        </UiCard>

        <UiCard class="rounded-[28px] border border-white/75 bg-white/74 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-[18px]">
          <UiCardHeader class="gap-4 p-5">
            <div>
              <UiCardTitle class="text-xl font-semibold tracking-[-0.04em] text-slate-950">
                模板与导出
              </UiCardTitle>
              <UiCardDescription class="mt-1 text-sm leading-6 text-slate-500">
                模板沉淀、分享和导出都围绕当前项目发生。
              </UiCardDescription>
            </div>

            <div class="grid gap-3">
              <input
                v-model="personalTemplateName"
                type="text"
                class="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none"
                placeholder="保存为个人模板的名称"
              >
              <UiButton type="button" variant="outline" class="h-11 rounded-2xl border-slate-200 bg-white px-4 text-slate-700" @click="saveAsTemplate">
                <Copy class="mr-2 size-4" />
                保存为模板
              </UiButton>
              <UiButton type="button" variant="outline" class="h-11 rounded-2xl border-slate-200 bg-white px-4 text-slate-700" @click="exportCsv">
                <Download class="mr-2 size-4" />
                导出 CSV
              </UiButton>
              <UiButton type="button" variant="outline" class="h-11 rounded-2xl border-slate-200 bg-white px-4 text-slate-700" @click="exportSnapshot">
                <Download class="mr-2 size-4" />
                图片导出入口
              </UiButton>
            </div>
          </UiCardHeader>
        </UiCard>
      </aside>
    </div>

    <UiSheet :open="!!activeCellEditor" @update:open="(value) => !value && closeCellEditor()">
      <UiSheetContent side="right" class="w-full max-w-[560px] border-l border-slate-200 bg-white/96 px-0">
        <template v-if="currentProject && activeEditorRow && activeEditorColumn && activeEditorCell">
          <UiSheetHeader class="border-b border-slate-200 px-6 py-5">
            <div class="flex items-center gap-2">
              <UiSheetTitle class="text-xl font-semibold tracking-[-0.04em] text-slate-950">
                {{ activeEditorRow.title }} · {{ activeEditorColumn.title }}
              </UiSheetTitle>
              <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-slate-600 uppercase">
                {{ getColumnTypeLabel(activeEditorColumn.type) }}
              </span>
            </div>
            <UiSheetDescription class="text-sm leading-6 text-slate-500">
              主矩阵里只看摘要，详细编辑放在这里完成，更适合正式产品的矩阵体验。
            </UiSheetDescription>
          </UiSheetHeader>

          <div class="grid gap-5 overflow-y-auto px-6 py-5">
            <div class="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
              <p class="text-xs font-semibold tracking-[0.16em] uppercase text-slate-500">当前对象</p>
              <p class="mt-2 text-lg font-semibold text-slate-950">{{ activeEditorRow.title }}</p>
              <p class="mt-1 text-sm leading-6 text-slate-500">{{ activeEditorRow.subtitle || '还没有补充定位说明。' }}</p>
            </div>

            <div v-if="activeEditorColumn.type === 'score'" class="grid gap-4">
              <div class="grid gap-2">
                <label class="text-xs font-semibold tracking-[0.16em] uppercase text-slate-500">评分</label>
                <div class="flex items-center gap-3">
                  <input
                    :value="activeEditorCell.score ?? ''"
                    type="number"
                    min="1"
                    max="10"
                    class="h-12 w-28 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-base font-semibold text-slate-900 outline-none"
                    placeholder="1-10"
                    @input="updateCell(currentProject.id, activeEditorRow.id, activeEditorColumn.id, { score: ($event.target as HTMLInputElement).value === '' ? null : Math.min(10, Math.max(1, Number(($event.target as HTMLInputElement).value))) })"
                  >
                  <input
                    :value="activeEditorColumn.weight"
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    class="h-2 flex-1 accent-teal-700"
                    @input="updateColumn(currentProject, activeEditorColumn, { weight: Number(($event.target as HTMLInputElement).value) })"
                  >
                  <span class="inline-flex min-w-12 items-center justify-center rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                    W{{ activeEditorColumn.weight }}
                  </span>
                </div>
              </div>

              <div class="grid gap-2">
                <label class="text-xs font-semibold tracking-[0.16em] uppercase text-slate-500">评分理由</label>
                <textarea
                  :value="activeEditorCell.note"
                  rows="6"
                  class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-900 outline-none"
                  placeholder="把为什么打这个分写清楚，方便后续复盘。"
                  @input="updateCell(currentProject.id, activeEditorRow.id, activeEditorColumn.id, { note: ($event.target as HTMLTextAreaElement).value })"
                />
              </div>
            </div>

            <div v-else-if="activeEditorColumn.type === 'numeric'" class="grid gap-4">
              <div class="grid gap-2">
                <label class="text-xs font-semibold tracking-[0.16em] uppercase text-slate-500">数值</label>
                <input
                  :value="activeEditorCell.numeric ?? ''"
                  type="number"
                  class="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base font-semibold text-slate-900 outline-none"
                  :placeholder="activeEditorColumn.unit ? `请输入 ${activeEditorColumn.unit}` : '请输入数值'"
                  @input="updateCell(currentProject.id, activeEditorRow.id, activeEditorColumn.id, { numeric: ($event.target as HTMLInputElement).value === '' ? null : Number(($event.target as HTMLInputElement).value) })"
                >
              </div>

              <div class="grid gap-2">
                <label class="text-xs font-semibold tracking-[0.16em] uppercase text-slate-500">单位</label>
                <input
                  :value="activeEditorColumn.unit"
                  type="text"
                  class="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none"
                  placeholder="元 / 分钟 / 平方米"
                  @input="updateColumn(currentProject, activeEditorColumn, { unit: ($event.target as HTMLInputElement).value })"
                >
              </div>
            </div>

            <div v-else-if="activeEditorColumn.type === 'select'" class="grid gap-4">
              <div class="grid gap-2">
                <label class="text-xs font-semibold tracking-[0.16em] uppercase text-slate-500">选择结果</label>
                <UiSelect
                  :model-value="activeEditorCell.select ?? SELECT_EMPTY_VALUE"
                  @update:model-value="updateActiveSelectValue"
                >
                  <UiSelectTrigger class="h-12 rounded-2xl border-slate-200 bg-slate-50 text-sm text-slate-900">
                    <UiSelectValue placeholder="请选择" />
                  </UiSelectTrigger>
                  <UiSelectContent>
                    <UiSelectItem :value="SELECT_EMPTY_VALUE">
                      请选择
                    </UiSelectItem>
                    <UiSelectItem v-for="option in activeEditorColumn.options" :key="option" :value="option">
                      {{ option }}
                    </UiSelectItem>
                  </UiSelectContent>
                </UiSelect>
              </div>

              <div class="grid gap-2">
                <label class="text-xs font-semibold tracking-[0.16em] uppercase text-slate-500">候选项配置</label>
                <textarea
                  :value="activeEditorColumn.options.join('\n')"
                  rows="5"
                  class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-900 outline-none"
                  placeholder="每行一个候选项"
                  @input="updateColumn(currentProject, activeEditorColumn, { options: ($event.target as HTMLTextAreaElement).value.split('\n').map(item => item.trim()).filter(Boolean) })"
                />
              </div>
            </div>

            <div v-else class="grid gap-2">
              <label class="text-xs font-semibold tracking-[0.16em] uppercase text-slate-500">详细说明</label>
              <textarea
                :value="activeEditorCell.text"
                rows="10"
                class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-900 outline-none"
                placeholder="把这个维度下的关键信息写完整。"
                @input="updateCell(currentProject.id, activeEditorRow.id, activeEditorColumn.id, { text: ($event.target as HTMLTextAreaElement).value })"
              />
            </div>
          </div>
        </template>
      </UiSheetContent>
    </UiSheet>
  </section>
</template>
