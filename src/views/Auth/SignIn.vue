<script setup lang="ts">
import AuthShell from './components/AuthShell.vue'
import AuthTitle from './components/AuthTitle.vue'
import LoginForm from './components/LoginForm.vue'
</script>

<template>
  <AuthShell
    eyebrow="ChoiceMatrix Workspace"
    title="让复杂选择，也能有更好的开场。"
    description="用更轻的方式收集信息、比较选项，把摇摆不定变成有依据的判断。"
  >
    <template #brand>
      <AuthTitle />
    </template>

    <LoginForm />
  </AuthShell>
</template>
