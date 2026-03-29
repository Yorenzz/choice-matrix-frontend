<script setup lang="ts">
import { ArrowRight, Plus, RotateCcw, Sparkles, Trash2 } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { toast } from 'vue-sonner'
import { RouterPath } from '@/constants/route-path'
import { useGuestMatrixStore } from '@/store/guest-matrix'

const guestMatrixStore = useGuestMatrixStore()
const { cells, dimensions, maxDimensions, maxOptions, options, title } = storeToRefs(guestMatrixStore)

const usageSummary = computed(() => {
  return `${options.value.length}/${maxOptions.value} 个选项 · ${dimensions.value.length}/${maxDimensions.value} 个维度`
})

function getCellKey(optionID: string, dimensionID: string) {
  return `${optionID}:${dimensionID}`
}

function getCell(optionID: string, dimensionID: string) {
  const key = getCellKey(optionID, dimensionID)
  return cells.value[key] ?? { score: null, note: '' }
}

function getOptionTotal(optionID: string) {
  let weightedScore = 0
  let totalWeight = 0

  dimensions.value.forEach((dimension) => {
    const cell = getCell(optionID, dimension.id)
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

const matrixColumns = computed(() => {
  return `240px repeat(${dimensions.value.length}, minmax(240px, 1fr)) 132px`
})

function addOption() {
  if (!guestMatrixStore.addOption()) {
    toast.error(`游客模式最多支持 ${maxOptions.value} 个选项`)
  }
}

function addDimension() {
  if (!guestMatrixStore.addDimension()) {
    toast.error(`游客模式最多支持 ${maxDimensions.value} 个维度`)
  }
}

function resetMatrix() {
  guestMatrixStore.resetMatrix()
  toast.success('游客矩阵已恢复为默认示例')
}

function parseScore(value: string) {
  if (value.trim() === '') {
    return null
  }

  const parsed = Number(value)
  if (Number.isNaN(parsed)) {
    return null
  }

  return parsed
}
</script>

<template>
  <section class="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,116,144,0.16),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.15),_transparent_24%),linear-gradient(135deg,_#f6f8f6_0%,_#f5f8fd_48%,_#fbf6ef_100%)]">
    <div class="mx-auto flex min-h-screen w-full max-w-[1480px] flex-col gap-6 px-4 py-5 lg:px-6">
      <header class="grid gap-4 rounded-[30px] border border-white/70 bg-white/72 px-5 py-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div class="grid gap-4">
          <div class="inline-flex w-fit items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-white uppercase">
            <Sparkles class="size-3.5" />
            Guest Matrix
          </div>

          <div class="grid gap-3">
            <div class="grid gap-2">
              <input
                :value="title"
                type="text"
                class="w-full border-none bg-transparent p-0 font-[Iowan_Old_Style,Palatino_Linotype,Noto_Serif_SC,serif] text-3xl font-semibold tracking-[-0.05em] text-slate-950 outline-none md:text-5xl"
                placeholder="给这次决策起个名字"
                @input="guestMatrixStore.setTitle(($event.target as HTMLInputElement).value)"
              >
              <p class="max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                不登录也能立刻开始比较。游客模式会把矩阵保存在当前浏览器，本地最多支持 5 个选项和 3 个维度。
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span class="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 font-medium">
                {{ usageSummary }}
              </span>
              <span class="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 font-medium text-amber-700">
                AI 总结与云端保存需登录后开启
              </span>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3 lg:justify-end">
          <UiButton type="button" variant="outline" class="h-11 rounded-2xl border-slate-200 bg-white/85 px-4 text-slate-700" @click="resetMatrix">
            <RotateCcw class="mr-2 size-4" />
            重置示例
          </UiButton>
          <UiButton type="button" variant="outline" class="h-11 rounded-2xl border-slate-200 bg-white/85 px-4 text-slate-700" @click="$router.push(RouterPath.LOGIN)">
            登录保存
          </UiButton>
          <UiButton type="button" class="h-11 rounded-2xl bg-slate-950 px-5 text-white shadow-[0_18px_44px_rgba(15,23,42,0.16)]" @click="$router.push(RouterPath.REGISTER)">
            注册后继续
            <ArrowRight class="ml-2 size-4" />
          </UiButton>
        </div>
      </header>

      <section class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div class="overflow-hidden rounded-[30px] border border-white/70 bg-white/82 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 px-5 py-4">
            <div>
              <h2 class="text-lg font-semibold text-slate-950">
                决策画布
              </h2>
              <p class="text-sm text-slate-500">
                先填分数，再补一句简短备注，你会更容易看清选择差异。
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <UiButton type="button" variant="outline" class="h-10 rounded-2xl border-slate-200 bg-white px-4 text-slate-700" @click="addDimension">
                <Plus class="mr-2 size-4" />
                新增维度
              </UiButton>
              <UiButton type="button" class="h-10 rounded-2xl bg-teal-700 px-4 text-white hover:bg-teal-600" @click="addOption">
                <Plus class="mr-2 size-4" />
                新增选项
              </UiButton>
            </div>
          </div>

          <div class="overflow-x-auto px-4 py-4">
            <div class="min-w-max" :style="{ display: 'grid', gap: '0.75rem' }">
              <div
                class="grid items-stretch gap-3"
                :style="{ gridTemplateColumns: matrixColumns }"
              >
                <div class="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    选项
                  </p>
                  <p class="mt-2 text-sm leading-6 text-slate-600">
                    左侧填写备选方案名称，右侧对每个维度打 0-10 分。
                  </p>
                </div>

                <div
                  v-for="dimension in dimensions"
                  :key="dimension.id"
                  class="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0 flex-1">
                      <input
                        :value="dimension.title"
                        type="text"
                        class="w-full border-none bg-transparent p-0 text-base font-semibold text-slate-900 outline-none"
                        placeholder="维度名称"
                        @input="guestMatrixStore.updateDimensionTitle(dimension.id, ($event.target as HTMLInputElement).value)"
                      >
                      <p class="mt-1 text-xs text-slate-500">
                        权重越高，对总分影响越大
                      </p>
                    </div>
                    <UiButton
                      v-if="dimensions.length > 1"
                      type="button"
                      variant="ghost"
                      class="h-9 w-9 rounded-2xl text-slate-400 hover:bg-white hover:text-rose-500"
                      @click="guestMatrixStore.removeDimension(dimension.id)"
                    >
                      <Trash2 class="size-4" />
                    </UiButton>
                  </div>

                  <div class="mt-3 flex items-center gap-3">
                    <input
                      :value="dimension.weight"
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      class="h-2 flex-1 accent-teal-700"
                      @input="guestMatrixStore.updateDimensionWeight(dimension.id, Number(($event.target as HTMLInputElement).value))"
                    >
                    <span class="inline-flex min-w-10 items-center justify-center rounded-full bg-white px-2.5 py-1 text-sm font-semibold text-slate-700">
                      {{ dimension.weight }}
                    </span>
                  </div>
                </div>

                <div class="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    总分
                  </p>
                  <p class="mt-2 text-sm leading-6 text-slate-600">
                    自动按加权平均计算，空分值会自动跳过。
                  </p>
                </div>
              </div>

              <div
                v-for="option in options"
                :key="option.id"
                class="grid items-stretch gap-3"
                :style="{ gridTemplateColumns: matrixColumns }"
              >
                <div class="rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-[0_12px_34px_rgba(15,23,42,0.04)]">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0 flex-1">
                      <input
                        :value="option.title"
                        type="text"
                        class="w-full border-none bg-transparent p-0 text-lg font-semibold text-slate-900 outline-none"
                        placeholder="选项名称"
                        @input="guestMatrixStore.updateOptionTitle(option.id, ($event.target as HTMLInputElement).value)"
                      >
                      <p class="mt-2 text-sm leading-6 text-slate-500">
                        比如某个产品、某套方案或某个 offer。
                      </p>
                    </div>
                    <UiButton
                      v-if="options.length > 1"
                      type="button"
                      variant="ghost"
                      class="h-9 w-9 rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-rose-500"
                      @click="guestMatrixStore.removeOption(option.id)"
                    >
                      <Trash2 class="size-4" />
                    </UiButton>
                  </div>
                </div>

                <div
                  v-for="dimension in dimensions"
                  :key="dimension.id"
                  class="rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-[0_12px_34px_rgba(15,23,42,0.04)]"
                >
                  <div class="flex items-center justify-between gap-3">
                    <label class="text-sm font-medium text-slate-600">分数</label>
                    <span class="rounded-full bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-700">
                      {{ getCell(option.id, dimension.id).score ?? '未评分' }}
                    </span>
                  </div>

                  <div class="mt-3 flex items-center gap-3">
                    <input
                      :value="getCell(option.id, dimension.id).score ?? ''"
                      type="range"
                      min="0"
                      max="10"
                      step="1"
                      class="h-2 flex-1 accent-slate-900"
                      @input="guestMatrixStore.updateCellScore(option.id, dimension.id, Number(($event.target as HTMLInputElement).value))"
                    >
                    <input
                      :value="getCell(option.id, dimension.id).score ?? ''"
                      type="number"
                      min="0"
                      max="10"
                      step="1"
                      class="h-10 w-16 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none focus:border-teal-600"
                      placeholder="-"
                      @input="guestMatrixStore.updateCellScore(option.id, dimension.id, parseScore(($event.target as HTMLInputElement).value))"
                    >
                  </div>

                  <textarea
                    :value="getCell(option.id, dimension.id).note"
                    rows="3"
                    class="mt-3 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700 outline-none transition focus:border-teal-600"
                    placeholder="补一句备注，说明这个分数的原因"
                    @input="guestMatrixStore.updateCellNote(option.id, dimension.id, ($event.target as HTMLTextAreaElement).value)"
                  />
                </div>

                <div class="rounded-3xl border border-slate-200 bg-slate-950 px-4 py-4 text-white shadow-[0_18px_40px_rgba(15,23,42,0.16)]">
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                    Weighted Score
                  </p>
                  <div class="mt-4">
                    <p class="text-4xl font-semibold tracking-[-0.06em]">
                      {{ getOptionTotal(option.id) ?? '--' }}
                    </p>
                    <p class="mt-2 text-sm leading-6 text-slate-300">
                      空评分会自动从分母剔除，更贴近真实比较场景。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside class="grid gap-4">
          <UiCard class="rounded-[30px] border-white/70 bg-white/82 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <UiCardHeader class="pb-3">
              <UiCardTitle class="text-xl font-semibold tracking-tight text-slate-950">
                当前排名
              </UiCardTitle>
              <UiCardDescription class="text-sm leading-6 text-slate-500">
                先用游客模式把判断结构搭起来，确认值得保存时再登录。
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
                    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Top {{ index + 1 }}
                    </p>
                    <p class="mt-1 text-base font-semibold text-slate-900">
                      {{ option.title || `未命名选项 ${index + 1}` }}
                    </p>
                  </div>
                  <div class="rounded-full bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white">
                    {{ option.total ?? '--' }}
                  </div>
                </div>
              </div>
            </UiCardContent>
          </UiCard>

          <UiCard class="rounded-[30px] border-teal-100 bg-[linear-gradient(180deg,rgba(236,253,245,0.95),rgba(255,255,255,0.92))] shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <UiCardHeader class="pb-2">
              <UiCardTitle class="text-xl font-semibold tracking-tight text-slate-950">
                游客模式能做什么
              </UiCardTitle>
            </UiCardHeader>
            <UiCardContent class="grid gap-3 text-sm leading-7 text-slate-600">
              <p>可以直接新增选项、编辑维度、打分和写备注，矩阵会自动保存在当前浏览器。</p>
              <p>游客模式适合先整理思路，登录后再解锁 AI 总结、跨设备保存和更大的容量。</p>
              <UiButton type="button" class="mt-2 h-11 rounded-2xl bg-teal-700 text-white hover:bg-teal-600" @click="$router.push(RouterPath.REGISTER)">
                登录后保存到云端
              </UiButton>
            </UiCardContent>
          </UiCard>
        </aside>
      </section>
    </div>
  </section>
</template>
