<template>
  <UiCard class="rounded-[1.75rem] border border-slate-200/80 bg-white/90 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
    <UiCardHeader>
      <UiCardTitle>近期活跃概览</UiCardTitle>
      <UiCardDescription>图表依赖尚未接入，先保留稳定占位，避免影响整体构建与工作台开发。</UiCardDescription>
    </UiCardHeader>
    <UiCardContent class="grid gap-3 sm:grid-cols-3">
      <div class="rounded-2xl bg-slate-50 p-4">
        <p class="text-sm text-slate-500">项目数</p>
        <p class="mt-2 text-2xl font-semibold text-slate-900">1</p>
      </div>
      <div class="rounded-2xl bg-slate-50 p-4">
        <p class="text-sm text-slate-500">本周编辑</p>
        <p class="mt-2 text-2xl font-semibold text-slate-900">12</p>
      </div>
      <div class="rounded-2xl bg-slate-50 p-4">
        <p class="text-sm text-slate-500">AI 可用点数</p>
        <p class="mt-2 text-2xl font-semibold text-slate-900">10</p>
      </div>
    </UiCardContent>
  </UiCard>
</template>
