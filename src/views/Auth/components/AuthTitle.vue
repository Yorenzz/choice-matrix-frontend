<script setup lang="ts">
import { useColorMode } from '@vueuse/core'

const mode = useColorMode()
const logo = computed(() => {
  return mode.value === 'dark' ? '/logo.svg' : '/logo-black.svg'
})
</script>

<template>
  <div class="auth-brand">
    <div class="auth-brand__mark">
      <img :src="logo" alt="ChoiceMatrix Logo" class="auth-brand__logo">
    </div>
    <div class="auth-brand__copy">
      <p class="auth-brand__eyebrow">
        Decision Studio
      </p>
      <h1 class="auth-brand__name">
        ChoiceMatrix
      </h1>
    </div>
  </div>
</template>
