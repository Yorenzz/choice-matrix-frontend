<script lang="ts" setup>
import type { LayoutHeaderProps } from './types'

import { cn } from '@/lib/utils'

defineProps<LayoutHeaderProps>()
</script>

<template>
  <header
    :class="cn(
      'flex flex-col gap-3 rounded-[1.75rem] border border-white/75 bg-white/62 px-5 py-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-[18px] sm:gap-4 sm:px-6 md:flex-row md:items-start md:justify-between',
      sticky ? 'sticky top-[5.5rem] z-20' : '',
    )"
  >
    <main class="min-w-0 space-y-1">
      <h1 class="font-display text-xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-2xl">
        {{ title }}
      </h1>
      <p v-if="description" class="max-w-3xl text-sm leading-7 text-slate-500 sm:text-base">
        {{ description }}
      </p>
    </main>

    <aside class="flex w-full flex-wrap items-center gap-2 md:w-auto md:justify-end">
      <slot name="actions" />
    </aside>
  </header>
</template>
