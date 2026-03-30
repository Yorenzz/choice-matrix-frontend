<script setup lang="ts">
import { ArrowRight, Brain, LayoutDashboard, LoaderCircle, Plus, RefreshCcw, Sparkles, Trash2 } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import {
  createProjectApi,
  generateProjectSummaryApi,
  getProjectPayloadApi,
  getProjectsApi,
  type MatrixCell,
  type Project,
  upsertCellApi,
} from '@/api/matrix'
import { useAuthStore } from '@/store/auth'

interface DecisionCellState {
  score: number | null
  note: string
}

interface DimensionItem {
  id: number
  title: string
  weight: number
}

interface OptionItem {
  id: number
  title: string
}

const authStore = useAuthStore()

const project = ref<Project | null>(null)
const dimensions = ref<DimensionItem[]>([])
const options = ref<OptionItem[]>([])
const cells = ref<Record<string, DecisionCellState>>({})
const loading = ref(true)
const creatingDimension = ref(false)
const creatingOption = ref(false)
const generatingSummary = ref(false)
const summary = ref('')
const localDimensionSeed = ref(-1)
const localOptionSeed = ref(-1)

const userPlan = computed(() => authStore.userInfo?.plan ?? 'free')
const isPro = computed(() => !!authStore.userInfo?.pro || userPlan.value === 'pro')
const maxOptions = computed(() => isPro.value ? 10 : 5)
const maxDimensions = computed(() => isPro.value ? 10 : 3)
const validCellCount = computed(() => Object.values(cells.value).filter(cell => cell.score !== null || cell.note.trim()).length)
const usageSummary = computed(() => `${options.value.length}/${maxOptions.value} 个方案 · ${dimensions.value.length}/${maxDimensions.value} 个维度`)
const matrixColumns = computed(() => `220px repeat(${options.value.length || 1}, minmax(240px, 1fr)) 132px`)

function getCellKey(dimensionID: number, optionID: number) {
  return `${dimensionID}:${optionID}`
}

function isLocalID(id: number) {
  return id <= 0
}

function normalizeCell(cell?: Partial<DecisionCellState>): DecisionCellState {
  return {
    score: typeof cell?.score === 'number' && !Number.isNaN(cell.score) ? cell.score : null,
    note: cell?.note ?? '',
  }
}

function getCell(dimensionID: number, optionID: number) {
  return cells.value[getCellKey(dimensionID, optionID)] ?? normalizeCell()
}

function createLocalDimension(title: string, weight = 1): DimensionItem {
  return {
    id: localDimensionSeed.value--,
    title,
    weight,
  }
}

function createLocalOption(title: string): OptionItem {
  return {
    id: localOptionSeed.value--,
    title,
  }
}

function ensureLocalDefaults() {
  if (!dimensions.value.length) {
    dimensions.value = [
      createLocalDimension('性价比', 4),
      createLocalDimension('长期体验', 3),
      createLocalDimension('上手成本', 2),
    ].slice(0, maxDimensions.value)
  }

  if (!options.value.length) {
    options.value = [
      createLocalOption('方案 A'),
      createLocalOption('方案 B'),
      createLocalOption('方案 C'),
    ].slice(0, maxOptions.value)
  }
}

function hydrateCells(input: MatrixCell[]) {
  const next: Record<string, DecisionCellState> = {}
  input.forEach((cell) => {
    next[getCellKey(cell.row_id, cell.column_id)] = {
      score: Number.isFinite(cell.score_value) && cell.score_value !== 0 ? cell.score_value : null,
      note: cell.text_content ?? '',
    }
  })
  cells.value = next
}

function getOptionTotal(optionID: number) {
  let weightedScore = 0
  let totalWeight = 0

  dimensions.value.forEach((dimension) => {
    const cell = getCell(dimension.id, optionID)
    if (cell.score === null || Number.isNaN(cell.score)) {
      return
    }

    weightedScore += cell.score * dimension.weight
    totalWeight += dimension.weight
  })

  if (totalWeight === 0) {
    return null
  }

  return Number((weightedScore / totalWeight).toFixed(1))
}

const rankedOptions = computed(() => {
  return [...options.value]
    .map(option => ({
      ...option,
      total: getOptionTotal(option.id),
    }))
    .sort((left, right) => (right.total ?? -1) - (left.total ?? -1))
})

function updateDimensionTitle(dimensionID: number, title: string) {
  const target = dimensions.value.find(item => item.id === dimensionID)
  if (target) {
    target.title = title
  }
}

function updateDimensionWeight(dimensionID: number, weight: number) {
  const target = dimensions.value.find(item => item.id === dimensionID)
  if (target) {
    target.weight = Math.min(5, Math.max(1, Number.isNaN(weight) ? 1 : weight))
  }
}

function updateOptionTitle(optionID: number, title: string) {
  const target = options.value.find(item => item.id === optionID)
  if (target) {
    target.title = title
  }
}

function removeDimension(dimensionID: number) {
  dimensions.value = dimensions.value.filter(item => item.id !== dimensionID)
  Object.keys(cells.value).forEach((key) => {
    if (key.startsWith(`${dimensionID}:`)) {
      delete cells.value[key]
    }
  })
}

function removeOption(optionID: number) {
  options.value = options.value.filter(item => item.id !== optionID)
  Object.keys(cells.value).forEach((key) => {
    if (key.endsWith(`:${optionID}`)) {
      delete cells.value[key]
    }
  })
}

async function ensureProject(): Promise<Project> {
  const { data: projects } = await getProjectsApi()
  const firstProject = projects[0]
  if (firstProject) {
    project.value = firstProject
    return firstProject
  }

  const { data } = await createProjectApi({ title: '我的决策工作台' })
  project.value = data
  return data
}

async function loadProject() {
  loading.value = true
  try {
    const currentProject = await ensureProject()
    const { data } = await getProjectPayloadApi(currentProject.id)
    project.value = data.project
    dimensions.value = data.rows.map(row => ({
      id: row.id,
      title: row.name,
      weight: 1,
    }))
    options.value = data.columns
      .filter(column => column.type === 'score')
      .map(column => ({
        id: column.id,
        title: column.title,
      }))
    hydrateCells(data.cells)
    ensureLocalDefaults()
  }
  finally {
    loading.value = false
  }
}

async function addDimension() {
  if (dimensions.value.length >= maxDimensions.value) {
    toast.error(isPro.value ? '当前专业版已达到维度上限。' : '免费版最多支持 3 个维度，升级后可扩展到 10 个。')
    return
  }

  creatingDimension.value = true
  try {
    dimensions.value.push(createLocalDimension(`维度 ${dimensions.value.length + 1}`))
  }
  finally {
    creatingDimension.value = false
  }
}

async function addOption() {
  if (options.value.length >= maxOptions.value) {
    toast.error(isPro.value ? '当前专业版已达到方案上限。' : '免费版最多支持 5 个方案，升级后可扩展到 10 个。')
    return
  }

  creatingOption.value = true
  try {
    options.value.push(createLocalOption(`方案 ${String.fromCharCode(65 + options.value.length)}`))
  }
  finally {
    creatingOption.value = false
  }
}

function parseScore(value: string) {
  if (value.trim() === '') {
    return null
  }

  const parsed = Number(value)
  if (Number.isNaN(parsed)) {
    return null
  }

  return Math.min(10, Math.max(0, parsed))
}

async function saveCell(dimensionID: number, optionID: number, nextValue: DecisionCellState) {
  const key = getCellKey(dimensionID, optionID)
  cells.value[key] = normalizeCell(nextValue)

  if (!project.value || isLocalID(dimensionID) || isLocalID(optionID)) {
    return
  }

  try {
    await upsertCellApi(project.value.id, {
      row_id: dimensionID,
      column_id: optionID,
      text_content: cells.value[key].note,
      numeric_value: cells.value[key].score ?? 0,
      score_value: cells.value[key].score ?? 0,
    })
  }
  catch (error: any) {
    toast.error(error.message || '保存评分失败')
  }
}

async function updateCellScore(dimensionID: number, optionID: number, score: number | null) {
  await saveCell(dimensionID, optionID, {
    ...getCell(dimensionID, optionID),
    score,
  })
}

async function updateCellNote(dimensionID: number, optionID: number, note: string) {
  await saveCell(dimensionID, optionID, {
    ...getCell(dimensionID, optionID),
    note,
  })
}

async function generateSummary() {
  if (!project.value) {
    return
  }

  if (validCellCount.value < 4) {
    toast.error('至少完善 4 个有效单元格后再生成 AI 总结。')
    return
  }

  generatingSummary.value = true
  try {
    const { data } = await generateProjectSummaryApi(project.value.id)
    summary.value = data.summary
    toast.success('AI 总结已生成')
  }
  catch (error: any) {
    toast.error(error.message || 'AI 总结生成失败')
  }
  finally {
    generatingSummary.value = false
  }
}

onMounted(async () => {
  try {
    await loadProject()
  }
  catch (error: any) {
    toast.error(error.message || '加载决策工作台失败')
    ensureLocalDefaults()
    loading.value = false
  }
})
</script>

<template>
  <section class="min-h-full">
    <div class="grid gap-5">
      <header class="rounded-[2rem] border border-white/75 bg-white/68 px-5 py-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-[20px] sm:px-6">
        <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div class="grid gap-4">
            <div class="inline-flex w-fit items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-white uppercase">
              <LayoutDashboard class="size-3.5" />
              Auth Workspace
            </div>
            <div class="space-y-2">
              <h1 class="font-display text-[2rem] font-semibold tracking-[-0.05em] text-slate-950 sm:text-[2.4rem]">
                {{ project?.title || '我的决策工作台' }}
              </h1>
              <p class="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                当前已经按“方案是列、维度是行”重排，新增、编辑、删除也会跟着这个结构一起工作。
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span class="rounded-full border border-slate-200 bg-white/85 px-3 py-1.5 font-medium">
                {{ usageSummary }}
              </span>
              <span class="rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 font-medium text-teal-700">
                {{ isPro ? 'Pro 容量：10 x 10' : 'Free 容量：5 x 3' }}
              </span>
              <span class="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 font-medium text-amber-700">
                AI 点数：{{ authStore.userInfo?.credits ?? 0 }}
              </span>
            </div>
          </div>

          <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:justify-end">
            <UiButton
              variant="outline"
              class="h-11 rounded-2xl border-slate-200 bg-white/85 px-4 text-slate-700"
              :disabled="loading"
              @click="loadProject"
            >
              <RefreshCcw class="mr-2 size-4" />
              刷新数据
            </UiButton>
            <UiButton
              class="h-11 rounded-2xl bg-teal-700 px-5 text-white hover:bg-teal-600"
              :disabled="generatingSummary || validCellCount < 4"
              @click="generateSummary"
            >
              <LoaderCircle v-if="generatingSummary" class="mr-2 size-4 animate-spin" />
              <Brain v-else class="mr-2 size-4" />
              生成 AI 总结
            </UiButton>
          </div>
        </div>
      </header>

      <div v-if="loading" class="rounded-[2rem] border border-white/75 bg-white/70 px-6 py-12 text-center text-slate-500 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-[20px]">
        正在加载你的决策工作台...
      </div>

      <template v-else>
        <section class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div class="overflow-hidden rounded-[2rem] border border-white/75 bg-white/78 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-[20px]">
            <div class="flex flex-col gap-3 border-b border-slate-200/80 px-5 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6">
              <div>
                <h2 class="text-lg font-semibold text-slate-950">决策矩阵</h2>
                <p class="text-sm text-slate-500">
                  顶部是方案列，左侧是维度行。新增、编辑和删除都先支持本地交互。
                </p>
              </div>

              <div class="grid w-full gap-2 sm:flex sm:w-auto sm:flex-wrap">
                <UiButton
                  variant="outline"
                  class="h-10 rounded-2xl border-slate-200 bg-white px-4 text-slate-700"
                  :disabled="creatingDimension"
                  @click="addDimension"
                >
                  <Plus class="mr-2 size-4" />
                  新增维度
                </UiButton>
                <UiButton
                  class="h-10 rounded-2xl bg-slate-950 px-4 text-white"
                  :disabled="creatingOption"
                  @click="addOption"
                >
                  <Plus class="mr-2 size-4" />
                  新增方案
                </UiButton>
              </div>
            </div>

            <div class="overflow-x-auto px-3 py-3 sm:px-4 sm:py-4">
              <div class="min-w-max" :style="{ display: 'grid', gap: '0.75rem' }">
                <div class="grid items-stretch gap-3" :style="{ gridTemplateColumns: matrixColumns }">
                  <div class="rounded-3xl border border-slate-200 bg-slate-50 px-3 py-4 sm:px-4">
                    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">维度</p>
                    <p class="mt-2 text-sm leading-6 text-slate-600">每一行是一个评估维度，可以改名、调整权重或直接删除。</p>
                  </div>

                  <div
                    v-for="option in options"
                    :key="option.id"
                    class="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0 flex-1">
                        <input
                          :value="option.title"
                          type="text"
                          class="w-full border-none bg-transparent p-0 text-base font-semibold text-slate-900 outline-none"
                          placeholder="方案名称"
                          @input="updateOptionTitle(option.id, ($event.target as HTMLInputElement).value)"
                        >
                        <p class="mt-1 text-xs text-slate-500">
                          {{ option.id > 0 ? '项目中的现有方案' : '本地新增方案' }}
                        </p>
                      </div>
                      <UiButton
                        v-if="options.length > 1"
                        type="button"
                        variant="ghost"
                        class="h-9 w-9 rounded-2xl text-slate-400 hover:bg-white hover:text-rose-500"
                        @click="removeOption(option.id)"
                      >
                        <Trash2 class="size-4" />
                      </UiButton>
                    </div>
                  </div>

                  <div class="rounded-3xl border border-slate-200 bg-slate-50 px-3 py-4 sm:px-4">
                    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">总分</p>
                    <p class="mt-2 text-sm leading-6 text-slate-600">按维度权重计算每个方案的加权平均分。</p>
                  </div>
                </div>

                <div
                  v-for="dimension in dimensions"
                  :key="dimension.id"
                  class="grid items-stretch gap-3"
                  :style="{ gridTemplateColumns: matrixColumns }"
                >
                  <div class="rounded-3xl border border-slate-200 bg-white px-3 py-4 shadow-[0_12px_34px_rgba(15,23,42,0.04)] sm:px-4">
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0 flex-1">
                        <input
                          :value="dimension.title"
                          type="text"
                          class="w-full border-none bg-transparent p-0 text-lg font-semibold text-slate-900 outline-none"
                          placeholder="维度名称"
                          @input="updateDimensionTitle(dimension.id, ($event.target as HTMLInputElement).value)"
                        >
                        <div class="mt-3 flex items-center gap-3">
                          <input
                            :value="dimension.weight"
                            type="range"
                            min="1"
                            max="5"
                            step="1"
                            class="h-2 flex-1 accent-teal-700"
                            @input="updateDimensionWeight(dimension.id, Number(($event.target as HTMLInputElement).value))"
                          >
                          <span class="inline-flex min-w-10 items-center justify-center rounded-full bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-700">
                            {{ dimension.weight }}
                          </span>
                        </div>
                      </div>
                      <UiButton
                        v-if="dimensions.length > 1"
                        type="button"
                        variant="ghost"
                        class="h-9 w-9 rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-rose-500"
                        @click="removeDimension(dimension.id)"
                      >
                        <Trash2 class="size-4" />
                      </UiButton>
                    </div>
                  </div>

                  <div
                    v-for="option in options"
                    :key="option.id"
                    class="rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-[0_12px_34px_rgba(15,23,42,0.04)]"
                  >
                    <div class="flex items-center justify-between gap-3">
                      <label class="text-sm font-medium text-slate-600">分数</label>
                      <span class="rounded-full bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-700">
                        {{ getCell(dimension.id, option.id).score ?? '未评分' }}
                      </span>
                    </div>

                    <div class="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <input
                        :value="getCell(dimension.id, option.id).score ?? ''"
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        class="h-2 w-full flex-1 accent-slate-900"
                        @input="updateCellScore(dimension.id, option.id, Number(($event.target as HTMLInputElement).value))"
                      >
                      <input
                        :value="getCell(dimension.id, option.id).score ?? ''"
                        type="number"
                        min="0"
                        max="10"
                        step="1"
                        class="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none focus:border-teal-600 sm:w-16"
                        placeholder="-"
                        @input="updateCellScore(dimension.id, option.id, parseScore(($event.target as HTMLInputElement).value))"
                      >
                    </div>

                    <textarea
                      :value="getCell(dimension.id, option.id).note"
                      rows="3"
                      class="mt-3 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700 outline-none transition focus:border-teal-600"
                      placeholder="写一句备注，说明这个分数背后的原因"
                      @change="updateCellNote(dimension.id, option.id, ($event.target as HTMLTextAreaElement).value)"
                    />
                  </div>

                  <div class="rounded-3xl border border-slate-200 bg-slate-50 px-3 py-4 sm:px-4">
                    <p class="text-sm leading-6 text-slate-500">
                      这一行是维度行，不显示总分。
                    </p>
                  </div>
                </div>

                <div class="grid items-stretch gap-3" :style="{ gridTemplateColumns: matrixColumns }">
                  <div class="rounded-3xl border border-slate-200 bg-slate-50 px-3 py-4 sm:px-4">
                    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">方案总分</p>
                    <p class="mt-2 text-sm leading-6 text-slate-600">按所有维度的权重自动计算。</p>
                  </div>

                  <div
                    v-for="option in options"
                    :key="option.id"
                    class="rounded-3xl border border-slate-200 bg-slate-950 px-4 py-4 text-white shadow-[0_18px_40px_rgba(15,23,42,0.16)]"
                  >
                    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Weighted Score</p>
                    <div class="mt-4">
                      <p class="text-4xl font-semibold tracking-[-0.06em]">
                        {{ getOptionTotal(option.id) ?? '--' }}
                      </p>
                      <p class="mt-2 text-sm leading-6 text-slate-300">
                        {{ option.id > 0 ? '项目中的方案会继续沿用现有保存逻辑。' : '本地新增方案当前只做前端交互。' }}
                      </p>
                    </div>
                  </div>

                  <div class="rounded-3xl border border-slate-200 bg-slate-50 px-3 py-4 sm:px-4">
                    <p class="text-sm leading-6 text-slate-500">右侧排名卡片会同步更新。</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside class="grid gap-5">
            <UiCard class="rounded-[2rem] border-white/75 bg-white/78 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-[20px]">
              <UiCardHeader>
                <UiCardTitle class="text-xl font-semibold tracking-tight text-slate-950">当前排名</UiCardTitle>
                <UiCardDescription class="text-sm leading-6 text-slate-500">
                  现在是按方案列来排名，和你说的语义保持一致。
                </UiCardDescription>
              </UiCardHeader>
              <UiCardContent class="grid gap-3">
                <div
                  v-for="(option, index) in rankedOptions"
                  :key="option.id"
                  class="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <div class="flex items-center justify-between gap-3">
                    <div>
                      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Top {{ index + 1 }}</p>
                      <p class="mt-1 text-base font-semibold text-slate-900">{{ option.title }}</p>
                    </div>
                    <div class="rounded-full bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white">
                      {{ option.total ?? '--' }}
                    </div>
                  </div>
                </div>
              </UiCardContent>
            </UiCard>

            <UiCard class="rounded-[2rem] border-teal-100 bg-[linear-gradient(180deg,rgba(236,253,245,0.95),rgba(255,255,255,0.92))] shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
              <UiCardHeader>
                <UiCardTitle class="text-xl font-semibold tracking-tight text-slate-950">当前阶段说明</UiCardTitle>
              </UiCardHeader>
              <UiCardContent class="grid gap-3 text-sm leading-7 text-slate-600">
                <p>方案现在是列，维度现在是行。</p>
                <p>新增、编辑、删除会先在前端本地生效，方便你快速验证结构和交互。</p>
                <p>如果你要，我下一步就继续把这套正确方向的矩阵接成可保存到后端的正式版本。</p>
                <UiButton
                  variant="outline"
                  class="mt-1 h-11 rounded-2xl border-slate-200 bg-white/85 text-slate-700"
                  @click="$router.push('/guest-matrix')"
                >
                  查看游客版对照
                  <ArrowRight class="ml-2 size-4" />
                </UiButton>
              </UiCardContent>
            </UiCard>

            <UiCard class="rounded-[2rem] border-slate-200/80 bg-slate-950 text-white shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
              <UiCardHeader>
                <UiCardTitle class="flex items-center gap-2 text-xl">
                  <Sparkles class="size-5 text-amber-300" />
                  AI 总结
                </UiCardTitle>
                <UiCardDescription class="text-slate-300">
                  至少完善 4 个有效单元格后就可以生成一版总结。
                </UiCardDescription>
              </UiCardHeader>
              <UiCardContent>
                <p v-if="summary" class="text-sm leading-7 text-slate-200">
                  {{ summary }}
                </p>
                <p v-else class="text-sm leading-7 text-slate-400">
                  这里会展示基于当前矩阵生成的优劣势摘要。现在后端返回的是占位结果，但入口与数据流已经接好了。
                </p>
              </UiCardContent>
            </UiCard>
          </aside>
        </section>
      </template>
    </div>
  </section>
</template>
