<script setup lang="ts">
import { ArrowRight, ChartNoAxesColumn, LayoutDashboard, Sparkles } from 'lucide-vue-next'
import { RouterPath } from '@/constants/route-path'

const primaryAction = {
  label: '进入工作台',
  path: RouterPath.DASHBOARD as string,
  icon: LayoutDashboard,
}

const highlights = [
  {
    title: '把判断过程显性化',
    description: '把方案、维度、权重和评分拆开填写，避免只凭感觉做结论。',
  },
  {
    title: '先试用，再决定是否登录',
    description: '游客模式可以立即开始整理思路，确认值得保存时再进入账号体系。',
  },
  {
    title: '适合产品、方案和个人决策',
    description: '无论是选项目、比工具、定 offer，首页都先帮你把方法讲清楚。',
  },
]

const steps = [
  '写下候选方案，明确你到底在比较什么。',
  '设置评估维度与权重，让“重要程度”真正进入结果。',
  '逐项打分并补充备注，得到更稳的排序结论。',
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
            游客入口
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

      <main class="grid flex-1 items-center gap-6 py-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(380px,0.85fr)] lg:py-8">
        <section class="auth-shell__fade auth-shell__fade--delay grid gap-6">
          <div class="space-y-5">
            <div class="inline-flex w-fit items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-slate-700 uppercase shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur">
              <Sparkles class="size-3.5 text-teal-700" />
              内容介绍首页
            </div>

            <div class="space-y-4">
              <h2 class="max-w-4xl font-display text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.06em] text-slate-950 sm:text-[3.5rem] lg:text-[4.4rem]">
                把复杂选择写成一张清晰、可复盘的决策矩阵。
              </h2>
              <p class="max-w-2xl text-[1rem] leading-8 text-slate-600 sm:text-[1.06rem]">
                ChoiceMatrix 适合用来介绍你的评估方式、沉淀比较标准，也方便用户立刻进入游客模式体验，或登录后把内容保存到自己的空间。
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
          </div>

          <div class="grid gap-4 md:grid-cols-3">
            <UiCard
              v-for="item in highlights"
              :key="item.title"
              class="rounded-[1.75rem] border border-white/80 bg-white/72 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-[18px]"
            >
              <UiCardHeader class="gap-3">
                <div class="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <ChartNoAxesColumn class="size-5" />
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

        <aside class="auth-shell__fade auth-shell__fade--later">
          <div
            class="rounded-[2rem] border border-white/80 backdrop-blur-[22px]"
            style="background: linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,255,255,0.84)); box-shadow: 0 28px 90px rgba(15,23,42,0.12), inset 0 1px 0 rgba(255,255,255,0.88)"
          >
            <div class="grid gap-5 px-6 py-6 sm:px-8 sm:py-7">
              <div class="space-y-2">
                <p class="text-[0.72rem] font-semibold tracking-[0.28em] uppercase text-slate-500">
                  How It Works
                </p>
                <h3 class="font-display text-[1.5rem] font-semibold tracking-[-0.04em] text-slate-900 sm:text-[1.75rem]">
                  首页内容建议结构
                </h3>
                <p class="text-[0.94rem] leading-7 text-slate-500">
                  这一块可以承担网站介绍职责，同时自然承接游客入口与登录入口，不会让页面像纯表单一样单薄。
                </p>
              </div>

              <div class="grid gap-3">
                <div
                  v-for="(step, index) in steps"
                  :key="step"
                  class="flex gap-4 rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 px-4 py-4"
                >
                  <div class="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                    0{{ index + 1 }}
                  </div>
                  <p class="text-sm leading-7 text-slate-600">
                    {{ step }}
                  </p>
                </div>
              </div>

              <div class="grid gap-3 rounded-[1.5rem] bg-slate-950 px-5 py-5 text-white shadow-[0_18px_44px_rgba(15,23,42,0.16)]">
                <p class="text-sm font-semibold tracking-[0.18em] uppercase text-slate-300">
                  Entry
                </p>
                <p class="text-sm leading-7 text-slate-300">
                  现在可以直接进入本地工作台体验完整前端流程；如果你只想快速试填，也仍然可以走游客矩阵。
                </p>
                <div class="flex flex-col gap-2 sm:flex-row">
                  <UiButton
                    type="button"
                    class="h-11 flex-1 rounded-2xl bg-white text-slate-900 hover:bg-slate-100"
                    @click="$router.push(RouterPath.DASHBOARD)"
                  >
                    进入工作台
                  </UiButton>
                  <UiButton
                    type="button"
                    variant="outline"
                    class="h-11 flex-1 rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white/15"
                    @click="$router.push(RouterPath.GUEST_MATRIX)"
                  >
                    游客入口
                  </UiButton>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  </section>
</template>
