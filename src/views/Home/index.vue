<script setup lang="ts">
import {
  BriefcaseBusiness,
  ChartNoAxesColumn,
  CheckCircle2,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogIn,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  WandSparkles,
} from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterPath } from '@/constants/route-path'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()
const homePageRef = ref<HTMLElement | null>(null)
let revealObserver: IntersectionObserver | null = null

const isLoggedIn = computed(() => !!authStore.token || !!authStore.userInfo)

const headerAction = computed(() => ({
  label: isLoggedIn.value ? '进入工作台' : '登录',
  path: isLoggedIn.value ? (RouterPath.DASHBOARD as string) : (RouterPath.LOGIN as string),
  icon: isLoggedIn.value ? LayoutDashboard : LogIn,
}))

const footerPrimaryAction = computed(() => ({
  label: isLoggedIn.value ? '进入工作台' : '立即试用',
  path: isLoggedIn.value ? (RouterPath.DASHBOARD as string) : (RouterPath.GUEST_MATRIX as string),
  icon: isLoggedIn.value ? LayoutDashboard : WandSparkles,
}))

const highlights = [
  {
    title: '把选择拆开看',
    description: '把候选项、维度和权重放到一张表里，思路会清楚很多。',
    icon: ChartNoAxesColumn,
    tone: 'bg-slate-950',
  },
  {
    title: '先试再决定',
    description: '打开就能开始整理，顺手试一试你的判断框架。',
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

const previewColumns = [
  { title: '成长', weight: 'W4' },
  { title: '成本', weight: 'W3' },
  { title: '稳定', weight: 'W3' },
]

const previewRows = [
  {
    title: 'Offer A',
    scores: [9, 6, 7],
    total: '7.8',
    accent: 'bg-slate-950',
    note: '成长空间强，通勤一般',
  },
  {
    title: 'Offer B',
    scores: [7, 8, 8],
    total: '7.7',
    accent: 'bg-teal-700',
    note: '整体均衡，风险更低',
  },
  {
    title: 'Offer C',
    scores: [8, 5, 6],
    total: '6.6',
    accent: 'bg-amber-500',
    note: '机会不错，但成本偏高',
  },
]

onMounted(() => {
  const root = homePageRef.value
  if (!root) {
    return
  }

  const revealItems = root.querySelectorAll<HTMLElement>('[data-reveal]')
  if (!revealItems.length) {
    return
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) {
    revealItems.forEach(item => item.classList.add('is-visible'))
    return
  }

  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return
      }

      entry.target.classList.add('is-visible')
      revealObserver?.unobserve(entry.target)
    })
  }, {
    threshold: 0.18,
    rootMargin: '0px 0px -8% 0px',
  })

  revealItems.forEach(item => revealObserver?.observe(item))
})

onBeforeUnmount(() => {
  revealObserver?.disconnect()
  revealObserver = null
})
</script>

<template>
  <section ref="homePageRef" class="auth-shell-page cm-page-shell relative box-border min-h-[100dvh] overflow-hidden">
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
      <header data-reveal class="auth-shell__fade flex items-center justify-between gap-4 rounded-[2rem] border border-white/75 bg-white/60 px-5 py-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-[22px]">
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
            立即试用
          </UiButton>
          <UiButton
            class="h-11 rounded-2xl px-5 text-white shadow-[0_18px_40px_rgba(15,23,42,0.16)]"
            style="background: var(--cm-brand-gradient)"
            @click="$router.push(headerAction.path)"
          >
            <component :is="headerAction.icon" class="mr-2 size-4" />
            {{ headerAction.label }}
          </UiButton>
        </div>
      </header>

      <main class="grid flex-1 gap-10 py-6 lg:gap-16 lg:py-8">
        <section class="grid gap-6">
          <section data-reveal class="auth-shell__fade auth-shell__fade--delay grid gap-6">
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
                  适合比较多个方案、明确评估标准、留下判断依据。先把思路整理清楚，再决定什么时候开始同步和沉淀。
                </p>
              </div>

              <div class="flex flex-wrap gap-3">
                <div class="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-3 py-2 text-sm text-slate-600 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
                  <CheckCircle2 class="size-4 text-teal-700" />
                  打开即用
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

        <section data-reveal class="auth-shell__fade auth-shell__fade--later mt-2 grid gap-4 lg:mt-4">
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

          <div class="cm-panel-glass relative overflow-hidden rounded-[2rem] border backdrop-blur-[22px]">
            <div class="absolute -top-8 right-6 h-24 w-24 rounded-full bg-amber-200/40 blur-3xl" />
            <div class="absolute -left-6 bottom-10 h-24 w-24 rounded-full bg-teal-200/50 blur-3xl" />

            <div class="relative grid gap-6 px-6 py-6 sm:px-8 sm:py-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-end">
              <div class="grid content-end gap-4">
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
                </div>

              </div>

              <div class="grid gap-4">
                <div class="rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                  <div class="grid grid-cols-[1.25fr_repeat(3,0.7fr)_0.8fr] gap-2 text-center text-xs font-semibold text-slate-500">
                    <div class="text-left">
                      方案
                    </div>
                    <div
                      v-for="column in previewColumns"
                      :key="column.title"
                      class="rounded-xl bg-slate-50 px-2 py-2"
                    >
                      <div class="flex flex-col items-center gap-1">
                        <span>{{ column.title }}</span>
                        <span class="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold tracking-[0.12em] text-teal-700">
                          {{ column.weight }}
                        </span>
                      </div>
                    </div>
                    <div class="rounded-xl bg-slate-950 px-2 py-2 text-white">
                      总分
                    </div>
                  </div>

                  <div class="mt-3 grid gap-2.5">
                    <div
                      v-for="row in previewRows"
                      :key="row.title"
                      class="grid grid-cols-[1.25fr_repeat(3,0.7fr)_0.8fr] items-center gap-2"
                    >
                      <div class="rounded-2xl bg-slate-50 px-3 py-3 text-left">
                        <div class="flex items-center gap-2">
                          <span :class="row.accent" class="size-2.5 rounded-full" />
                          <span class="text-sm font-semibold text-slate-900">{{ row.title }}</span>
                        </div>
                        <div class="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                          <FileText class="size-3 text-amber-600" />
                          <span class="truncate">{{ row.note }}</span>
                        </div>
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

                <div class="flex flex-wrap items-center justify-start gap-2 px-1">
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
            </div>
          </div>
        </section>

        <section data-reveal class="auth-shell__fade auth-shell__fade--later mt-4 grid gap-4 lg:mt-8">
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

        <section data-reveal class="auth-shell__fade auth-shell__fade--later mt-4 grid gap-4 lg:mt-8">
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

        <section data-reveal class="auth-shell__fade auth-shell__fade--later mt-4 lg:mt-10">
          <div class="home-final-cta relative overflow-hidden rounded-[2.4rem] border border-white/80 px-6 py-8 shadow-[0_28px_90px_rgba(15,23,42,0.12)] backdrop-blur-[22px] sm:px-8 sm:py-10">
            <div class="home-final-cta__glow home-final-cta__glow--teal" aria-hidden="true" />
            <div class="home-final-cta__glow home-final-cta__glow--amber" aria-hidden="true" />
            <div class="home-final-cta__grid" aria-hidden="true" />

            <div class="relative grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_auto] lg:items-center">
              <div class="space-y-4">
                <div class="inline-flex w-fit items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-slate-700 uppercase shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur">
                  <Sparkles class="size-3.5 text-teal-700" />
                  Ready To Start
                </div>

                <div class="space-y-3">
                  <h3 class="max-w-3xl font-display text-[2rem] font-semibold leading-[1.04] tracking-[-0.05em] text-slate-950 sm:text-[2.6rem]">
                    把这次选择真正落到一张可继续推进的矩阵里。
                  </h3>
                  <p class="max-w-2xl text-[0.98rem] leading-8 text-slate-600 sm:text-[1.04rem]">
                    先试用快速搭框架，或者直接登录进入工作台。看到最后再开始，刚刚好。
                  </p>
                </div>
              </div>

              <div class="relative flex flex-wrap gap-3 lg:justify-end">
                <UiButton
                  class="home-final-cta__button h-12 rounded-2xl px-5 text-[0.96rem] font-semibold shadow-[0_18px_44px_rgba(15,23,42,0.16)]"
                  :class="isLoggedIn ? 'home-final-cta__button--dashboard text-white' : 'home-final-cta__button--trial text-white'"
                  @click="$router.push(footerPrimaryAction.path)"
                >
                  {{ footerPrimaryAction.label }}
                  <component :is="footerPrimaryAction.icon" class="ml-2 size-4" />
                </UiButton>
                <UiButton
                  v-if="!isLoggedIn"
                  class="home-final-cta__button home-final-cta__button--login h-12 rounded-2xl px-5 text-[0.96rem] font-semibold text-amber-950 shadow-[0_16px_36px_rgba(217,119,6,0.14)]"
                  @click="$router.push(RouterPath.LOGIN)"
                >
                  登录查看工作台
                  <LogIn class="ml-2 size-4" />
                </UiButton>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </section>
</template>
