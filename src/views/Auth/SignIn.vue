<script setup lang="ts">
import AuthTitle from './components/AuthTitle.vue'
import LoginForm from './components/LoginForm.vue'
</script>

<template>
  <div class="flex items-center justify-center min-h-screen p-4 w-[100vw] bg-slate-50 relative overflow-hidden">
    <!-- 炫光背景效果：增强色彩与面积使玻璃反射更明显 -->
    <div class="absolute -top-[5%] -left-[5%] w-[48vw] h-[48vw] rounded-full bg-indigo-500/30 blur-[100px] pointer-events-none" />
    <div class="absolute -bottom-[5%] -right-[5%] w-[48vw] h-[48vw] rounded-full bg-violet-500/30 blur-[100px] pointer-events-none" />
    
    <main class="flex flex-col gap-8 z-10 w-full max-w-sm">
      <div class="flex justify-center">
        <AuthTitle />
      </div>
      <LoginForm />
    </main>
  </div>
</template>
