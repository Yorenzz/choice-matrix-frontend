<script lang="ts" setup>
import type { LayoutHeaderProps } from './types'

import { cn } from '@/lib/utils'

defineProps<LayoutHeaderProps>()
</script>

<template>
  <header
    :class="cn(
      'flex flex-col gap-3 py-2 sm:gap-4 md:flex-row md:items-start md:justify-between',
      sticky ? 'sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80' : '',
    )"
  >
    <main class="min-w-0 space-y-1">
      <h1 class="text-xl font-bold sm:text-2xl">
        {{ title }}
      </h1>
      <p v-if="description" class="max-w-3xl text-sm text-muted-foreground sm:text-base">
        {{ description }}
      </p>
    </main>

    <aside class="flex w-full flex-wrap items-center gap-2 md:w-auto md:justify-end">
      <slot name="actions" />
    </aside>
  </header>
</template>
