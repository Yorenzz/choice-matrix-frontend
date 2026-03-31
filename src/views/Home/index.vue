<script setup lang="ts">
import {
  ArrowRight,
  BriefcaseBusiness,
  ChartNoAxesColumn,
  CheckCircle2,
  FileText,
  GraduationCap,
  LayoutDashboard,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  WandSparkles,
} from 'lucide-vue-next'
import { RouterPath } from '@/constants/route-path'

const primaryAction = {
  label: '进入工作台',
  path: RouterPath.DASHBOARD as string,
  icon: LayoutDashboard,
}

const highlights = [
  {
    title: '把选择拆开看',
    description: '把候选项、维度和权重放到一张表里，思路会清楚很多。',
    icon: ChartNoAxesColumn,
    tone: 'bg-slate-950',
  },
  {
    title: '先试再决定',
    description: '不用先注册，直接进入游客模式就能开始整理。',
    icon: WandSparkles,
    tone: 'bg-teal-700',
  },
  {
    title: '留下判断依据',
    description: '除了分数，还能写备注，方便回头复盘和解释。',
    icon: FileText,
    tone: 'bg-amber-500',
  },
]

const examples = [
  {
    title: '选 Offer',
    description: '比较薪资、成长空间、稳定性和通勤成本。',
    icon: BriefcaseBusiness,
    tags: ['薪资', '成长空间', '稳定性'],
  },
  {
    title: '选方案',
    description: '比较上线速度、长期成本和扩展性。',
    icon: SlidersHorizontal,
    tags: ['上线速度', '长期成本', '扩展性'],
  },
  {
    title: '选方向',
    description: '比较兴趣、投入产出和时间成本。',
    icon: GraduationCap,
    tags: ['兴趣', '投入产出', '时间成本'],
  },
]

const spotlightFeatures = [
  {
    badge: '亮点 01',
    title: '几分钟就能搭好第一张矩阵',
    description: '打开就能填，不会被复杂流程打断，适合先把犹豫中的选择快速摆出来。',
    icon: Sparkles,
  },
  {
    badge: '亮点 02',
    title: '不只看结果，也看为什么',
    description: '最后不只是一个排序，而是一套更容易讲清楚的判断过程。',
    icon: ShieldCheck,
  },
]

const previewColumns = ['成长', '成本', '稳定']

const previewRows = [
  {
    title: 'Offer A',
    scores: [9, 6, 7],
    total: '7.8',
    accent: 'bg-slate-950',
  },
  {
    title: 'Offer B',
    scores: [7, 8, 8],
    total: '7.7',
    accent: 'bg-teal-700',
  },
  {
    title: 'Offer C',
    scores: [8, 5, 6],
    total: '6.6',
    accent: 'bg-amber-500',
  },
]
</script>

<template>
  <section class="auth-shell-page relative box-border min-h-[100dvh] overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(14,116,144,0.16),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.12),_transparent_26%),linear-gradient(135deg,_#f4f7f6_0%,_#f7f9fc_48%,_#fbf7f1_100%)]">
    <div class="auth-shell__backdrop" aria-hidden="true">
      <div class="auth-shell__mesh" />
      <div class="auth-shell__spotlight auth-shell__spotlight--one" />
      <div class="auth-shell__spotlight auth-shell__spotlight--two" />
      <div class="auth-shell__orb auth-shell__orb--indigo" />
      <div class="auth-shell__orb auth-shell__orb--amber" />
      <div class="auth-shell__orb auth-shell__orb--teal" />
      <div class="auth-shell__orb auth-shell__orb--slate" />
      <div class="auth-shell__orb auth-shell__orb--coral" />
      <div class="auth-shell__particles" />
      <div class="auth-shell__grain" />
    </div>

    <div class="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-7xl flex-col px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <header class="auth-shell__fade flex items-center justify-between gap-4 rounded-[2rem] border border-white/75 bg-white/60 px-5 py-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-[22px]">
        <div>
          <p class="text-[0.72rem] font-semibold tracking-[0.28em] uppercase text-slate-500">
            Decision Studio
          </p>
          <h1 class="mt-1 font-display text-[1.5rem] font-semibold tracking-[-0.04em] text-slate-900 sm:text-[1.7rem]">
            ChoiceMatrix
          </h1>
        </div>

        <div class="flex flex-wrap items-center justify-end gap-2">
          <UiButton
            variant="outline"
            class="h-11 rounded-2xl border-slate-200/90 bg-white/85 px-4 text-slate-700"
            @click="$router.push(RouterPath.GUEST_MATRIX)"
          >
            游客体验
          </UiButton>
          <UiButton
            class="h-11 rounded-2xl px-5 text-white shadow-[0_18px_40px_rgba(15,23,42,0.16)]"
            style="background: linear-gradient(135deg,#0f172a 0%,#1f2937 100%)"
            @click="$router.push(primaryAction.path)"
          >
            <component :is="primaryAction.icon" class="mr-2 size-4" />
            {{ primaryAction.label }}
          </UiButton>
        </div>
      </header>

      <main class="grid flex-1 gap-10 py-6 lg:gap-16 lg:py-8">
        <section class="grid gap-6">
          <section class="auth-shell__fade auth-shell__fade--delay grid gap-6">
            <div class="space-y-5">
              <div class="inline-flex w-fit items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-slate-700 uppercase shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur">
                <Sparkles class="size-3.5 text-teal-700" />
                更理性的选择方式
              </div>

              <div class="space-y-4">
                <h2 class="max-w-4xl font-display text-[2.7rem] font-semibold leading-[1.02] tracking-[-0.06em] text-slate-950 sm:text-[3.6rem] lg:text-[4.5rem]">
                  把复杂选择整理成一张清楚的决策矩阵。
                </h2>
                <p class="max-w-2xl text-[1rem] leading-8 text-slate-600 sm:text-[1.06rem]">
                  适合比较多个方案、明确评估标准、留下判断依据。先试用，再决定要不要保存。
                </p>
              </div>

              <div class="flex flex-wrap gap-3">
                <UiButton
                  class="h-12 rounded-2xl px-5 text-[0.96rem] font-semibold text-white shadow-[0_18px_44px_rgba(15,23,42,0.16)]"
                  style="background: linear-gradient(135deg,#0f172a 0%,#1f2937 100%)"
                  @click="$router.push(primaryAction.path)"
                >
                  {{ primaryAction.label }}
                  <ArrowRight class="ml-2 size-4" />
                </UiButton>
                <UiButton
                  variant="outline"
                  class="h-12 rounded-2xl border-slate-200/90 bg-white/85 px-5 text-[0.96rem] font-semibold text-slate-700"
                  @click="$router.push(RouterPath.GUEST_MATRIX)"
                >
                  先用游客模式体验
                </UiButton>
              </div>

              <div class="flex flex-wrap gap-3">
                <div class="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-3 py-2 text-sm text-slate-600 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
                  <CheckCircle2 class="size-4 text-teal-700" />
                  支持游客体验
                </div>
                <div class="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-3 py-2 text-sm text-slate-600 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
                  <CheckCircle2 class="size-4 text-teal-700" />
                  自定义权重
                </div>
                <div class="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-3 py-2 text-sm text-slate-600 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
                  <CheckCircle2 class="size-4 text-teal-700" />
                  备注与复盘
                </div>
              </div>
            </div>

            <div class="grid gap-4 md:grid-cols-3">
              <UiCard
                v-for="item in highlights"
                :key="item.title"
                class="rounded-[1.75rem] border border-white/80 bg-white/72 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-[18px]"
              >
                <UiCardHeader class="gap-3">
                  <div :class="item.tone" class="flex size-11 items-center justify-center rounded-2xl text-white">
                    <component :is="item.icon" class="size-5" />
                  </div>
                  <UiCardTitle class="text-lg font-semibold tracking-[-0.03em] text-slate-900">
                    {{ item.title }}
                  </UiCardTitle>
                  <UiCardDescription class="text-sm leading-7 text-slate-500">
                    {{ item.description }}
                  </UiCardDescription>
                </UiCardHeader>
              </UiCard>
            </div>
          </section>
        </section>

        <section class="auth-shell__fade auth-shell__fade--later mt-2 grid gap-4 lg:mt-4">
          <div class="flex items-center gap-3">
            <div class="flex size-11 items-center justify-center rounded-2xl bg-white/75 text-slate-900 shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
              <ChartNoAxesColumn class="size-5" />
            </div>
            <div class="space-y-1">
              <p class="text-[0.72rem] font-semibold tracking-[0.28em] uppercase text-slate-500">
                Preview
              </p>
              <h3 class="font-display text-[2rem] font-semibold tracking-[-0.05em] text-slate-950 sm:text-[2.3rem]">
                一个更直观的选择面板
              </h3>
            </div>
          </div>

          <div
            class="relative overflow-hidden rounded-[2rem] border border-white/80 backdrop-blur-[22px]"
            style="background: linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,255,255,0.84)); box-shadow: 0 28px 90px rgba(15,23,42,0.12), inset 0 1px 0 rgba(255,255,255,0.88)"
          >
            <div class="absolute -top-8 right-6 h-24 w-24 rounded-full bg-amber-200/40 blur-3xl" />
            <div class="absolute -left-6 bottom-10 h-24 w-24 rounded-full bg-teal-200/50 blur-3xl" />

            <div class="relative grid gap-6 px-6 py-6 sm:px-8 sm:py-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
              <div class="grid gap-4">
                <div class="rounded-[1.75rem] border border-slate-200/80 bg-white/80 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                  <p class="text-sm font-semibold text-slate-900">
                    快速看板
                  </p>
                  <p class="mt-1 text-sm leading-7 text-slate-500">
                    用一张面板先把候选项、维度和结果放在一起看。
                  </p>
                </div>

                <div class="grid grid-cols-3 gap-2 lg:grid-cols-1">
                  <div class="rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-3 text-center lg:text-left">
                    <p class="text-xs text-slate-500">
                      候选项
                    </p>
                    <p class="mt-1 text-lg font-semibold text-slate-900">
                      3
                    </p>
                  </div>
                  <div class="rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-3 text-center lg:text-left">
                    <p class="text-xs text-slate-500">
                      维度
                    </p>
                    <p class="mt-1 text-lg font-semibold text-slate-900">
                      3
                    </p>
                  </div>
                  <div class="rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-3 text-center lg:text-left">
                    <p class="text-xs text-slate-500">
                      备注
                    </p>
                    <p class="mt-1 text-lg font-semibold text-slate-900">
                      已开启
                    </p>
                  </div>
                </div>

                <div class="flex flex-wrap gap-2 lg:flex-col">
                  <div class="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-2 text-sm font-medium text-teal-700">
                    <SlidersHorizontal class="size-4" />
                    自定义权重
                  </div>
                  <div class="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
                    <FileText class="size-4" />
                    支持备注
                  </div>
                  <div class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
                    <CheckCircle2 class="size-4" />
                    自动排序
                  </div>
                </div>
              </div>

              <div class="rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                <div class="grid grid-cols-[1.1fr_repeat(3,0.7fr)_0.8fr] gap-2 text-center text-xs font-semibold text-slate-500">
                  <div class="text-left">
                    方案
                  </div>
                  <div
                    v-for="column in previewColumns"
                    :key="column"
                    class="rounded-xl bg-slate-50 px-2 py-2"
                  >
                    {{ column }}
                  </div>
                  <div class="rounded-xl bg-slate-950 px-2 py-2 text-white">
                    总分
                  </div>
                </div>

                <div class="mt-3 grid gap-2.5">
                  <div
                    v-for="row in previewRows"
                    :key="row.title"
                    class="grid grid-cols-[1.1fr_repeat(3,0.7fr)_0.8fr] items-center gap-2"
                  >
                    <div class="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-3 text-left">
                      <span :class="row.accent" class="size-2.5 rounded-full" />
                      <span class="text-sm font-semibold text-slate-900">{{ row.title }}</span>
                    </div>
                    <div
                      v-for="score in row.scores"
                      :key="`${row.title}-${score}`"
                      class="rounded-2xl border border-slate-200/80 bg-white px-2 py-3 text-sm font-semibold text-slate-700"
                    >
                      {{ score }}
                    </div>
                    <div class="rounded-2xl bg-slate-950 px-2 py-3 text-sm font-semibold text-white">
                      {{ row.total }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="auth-shell__fade auth-shell__fade--later mt-4 grid gap-4 lg:mt-8">
          <div class="flex items-center gap-3">
            <div class="flex size-11 items-center justify-center rounded-2xl bg-white/75 text-slate-900 shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
              <BriefcaseBusiness class="size-5" />
            </div>
            <div class="space-y-1">
              <p class="text-[0.72rem] font-semibold tracking-[0.28em] uppercase text-slate-500">
                Use Cases
              </p>
              <h3 class="font-display text-[2rem] font-semibold tracking-[-0.05em] text-slate-950 sm:text-[2.3rem]">
                常见的三种使用场景
              </h3>
            </div>
          </div>

          <div class="grid gap-4 lg:grid-cols-3">
            <UiCard
              v-for="example in examples"
              :key="example.title"
              class="rounded-[2rem] border border-white/80 bg-white/78 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-[18px]"
            >
              <UiCardHeader class="gap-4">
                <div class="flex items-center justify-between gap-3">
                  <div class="flex size-11 items-center justify-center rounded-2xl bg-teal-700 text-white">
                    <component :is="example.icon" class="size-5" />
                  </div>
                  <CheckCircle2 class="size-5 text-slate-300" />
                </div>
                <div class="space-y-2">
                  <UiCardTitle class="text-xl font-semibold tracking-[-0.03em] text-slate-900">
                    {{ example.title }}
                  </UiCardTitle>
                  <UiCardDescription class="text-sm leading-7 text-slate-500">
                    {{ example.description }}
                  </UiCardDescription>
                </div>
              </UiCardHeader>
              <UiCardContent class="flex flex-wrap gap-2">
                <span
                  v-for="tag in example.tags"
                  :key="tag"
                  class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600"
                >
                  {{ tag }}
                </span>
              </UiCardContent>
            </UiCard>
          </div>
        </section>

        <section class="auth-shell__fade auth-shell__fade--later mt-4 grid gap-4 lg:mt-8">
          <div class="flex items-center gap-3">
            <div class="flex size-11 items-center justify-center rounded-2xl bg-white/75 text-slate-900 shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
              <ShieldCheck class="size-5" />
            </div>
            <div class="space-y-1">
              <p class="text-[0.72rem] font-semibold tracking-[0.28em] uppercase text-slate-500">
                Why It Helps
              </p>
              <h3 class="font-display text-[2rem] font-semibold tracking-[-0.05em] text-slate-950 sm:text-[2.3rem]">
                两个值得强调的点
              </h3>
            </div>
          </div>

          <div class="grid gap-4 lg:grid-cols-2">
            <UiCard
              v-for="feature in spotlightFeatures"
              :key="feature.title"
              class="rounded-[2rem] border border-white/80 bg-white/78 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-[18px]"
            >
              <UiCardHeader class="gap-4">
                <div class="flex items-center justify-between gap-3">
                  <span class="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-amber-700 uppercase">
                    {{ feature.badge }}
                  </span>
                  <div class="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <component :is="feature.icon" class="size-5" />
                  </div>
                </div>
                <UiCardTitle class="font-display text-[1.65rem] font-semibold tracking-[-0.04em] text-slate-950">
                  {{ feature.title }}
                </UiCardTitle>
                <UiCardDescription class="text-sm leading-7 text-slate-500 sm:text-base">
                  {{ feature.description }}
                </UiCardDescription>
              </UiCardHeader>
            </UiCard>
          </div>
        </section>
      </main>
    </div>
  </section>
</template>
