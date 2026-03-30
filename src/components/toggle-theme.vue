<script setup lang="ts">
import { useColorMode } from '@vueuse/core'
import { Moon, Sun, SunMoon } from 'lucide-vue-next'

withDefaults(defineProps<{
  triggerClass?: string
  menuAlign?: 'start' | 'center' | 'end'
}>(), {
  triggerClass: '',
  menuAlign: 'end',
})

const mode = useColorMode()
</script>

<template>
  <UiDropdownMenu>
    <UiDropdownMenuTrigger as-child>
      <UiButton
        variant="outline"
        size="icon"
        :class="triggerClass || 'h-9 w-9 rounded-xl border-slate-200 bg-white'"
      >
        <Moon class="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Sun class="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span class="sr-only">Toggle theme</span>
      </UiButton>
    </UiDropdownMenuTrigger>
    <UiDropdownMenuContent :align="menuAlign" class="rounded-2xl">
      <UiDropdownMenuItem class="rounded-xl" @click="mode = 'light'">
        <Sun class="size-4" />
        Light
      </UiDropdownMenuItem>
      <UiDropdownMenuItem class="rounded-xl" @click="mode = 'dark'">
        <Moon class="size-4" />
        Dark
      </UiDropdownMenuItem>
      <UiDropdownMenuItem class="rounded-xl" @click="mode = 'auto'">
        <SunMoon class="size-4" />
        System
      </UiDropdownMenuItem>
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>
