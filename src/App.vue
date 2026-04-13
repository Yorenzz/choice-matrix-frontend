<script setup lang="ts">
import { onMounted } from 'vue'
import Loading from '@/components/Loading.vue'
import { Toaster } from '@/components/ui/sonner'
import { useSystemTheme } from '@/composables/use-system-theme'
import { useAuthStore } from '@/store/auth'
import { useDecisionWorkspaceStore } from '@/store/decision-workspace'
import { getToken } from '@/utils/auth'

useSystemTheme()

const authStore = useAuthStore()
const workspaceStore = useDecisionWorkspaceStore()

onMounted(async () => {
  authStore.token = getToken() || ''
  if (authStore.userInfo) {
    await workspaceStore.ensureLoaded()
    return
  }

  if (!authStore.userInfo) {
    try {
      await authStore.bootstrapAuth()
      await workspaceStore.ensureLoaded()
    }
    catch {
      // Redirect and cleanup are handled by the request layer and route guard.
    }
  }
})
</script>

<template>
  <Toaster />

  <Suspense>
    <router-view v-slot="{ Component, route }">
      <component :is="Component" :key="route" />
    </router-view>

    <template #fallback>
      <Loading />
    </template>
  </Suspense>
</template>
