<script setup lang="ts">
import { useColorMode } from '@vueuse/core'

const mode = useColorMode()
const logo = computed(() => {
  return mode.value === 'dark' ? '/logo.svg' : '/logo-black.svg'
})
</script>

<template>
  <h1 class="flex items-center gap-2 text-xl font-bold">
    <img :src="logo" alt="ChoiceMatrix Logo" class="w-8 h-8">
    <span class="text-indigo-600">ChoiceMatrix</span>
  </h1>
</template>
