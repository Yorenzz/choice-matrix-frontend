<script lang="ts" setup>
import { ref } from 'vue'
import { useAuth } from '@/composables/use-auth'

import GitHubButton from './GithubButton.vue'
import GoogleButton from './GoogleButton.vue'
import PrivacyPolicyButton from './PrivacyPolicyButton.vue'
import TermsOfServiceButton from './TermsOfServiceButton.vue'
import ToForgotPasswordLink from './ToForgotPasswordLink.vue'

const { login, loading } = useAuth()
const form = ref({
  email: '',
  password: '',
})

const handleLogin = () => {
  login(form.value)
}
</script>

<template>
  <UiCard class="w-full max-w-sm rounded-[2rem] shadow-2xl shadow-indigo-900/10 border border-white/60 !bg-white/40 backdrop-blur-2xl">
    <UiCardHeader>
      <UiCardTitle class="text-2xl font-bold tracking-tight text-slate-900">
        欢迎回来
      </UiCardTitle>
      <UiCardDescription class="text-slate-500 mt-2">
        输入您的邮箱账号与密码组合，即刻开启结构化决策。
        <br>
        <span class="mt-2 block">
          还没有账号？
          <UiButton
            variant="link" class="px-0 text-indigo-600 font-semibold"
            @click="$router.push('/auth/sign-up')"
          >
            立即注册
          </UiButton>
        </span>
      </UiCardDescription>
    </UiCardHeader>
    <UiCardContent class="grid gap-4">
      <div class="grid gap-2">
        <UiLabel for="email" class="text-slate-700">
          邮箱地址
        </UiLabel>
        <UiInput id="email" v-model="form.email" type="email" placeholder="输入邮箱... (例: me@example.com)" required class="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20" />
      </div>
      <div class="grid gap-2">
        <div class="flex items-center justify-between">
          <UiLabel for="password" class="text-slate-700">
            密码
          </UiLabel>
          <ToForgotPasswordLink class="text-indigo-600 hover:text-indigo-500" />
        </div>
        <UiInput id="password" v-model="form.password" type="password" required placeholder="*********" class="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20" />
      </div>

      <UiButton class="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all text-white shadow-md shadow-indigo-600/20" @click="handleLogin" :disabled="loading">
        <UiSpinner v-if="loading" class="mr-2" />
        登录系统
      </UiButton>

      <UiSeparator label="或通过以下方式登录" class="my-2" />

      <div class="flex flex-col items-center justify-between gap-4">
        <GitHubButton />
        <GoogleButton />
      </div>

      <UiCardDescription class="text-center text-xs mt-2 text-slate-400">
        点击登录即表示您同意我们的
        <TermsOfServiceButton class="text-indigo-600 hover:underline" />
        与
        <PrivacyPolicyButton class="text-indigo-600 hover:underline" />
      </UiCardDescription>
    </UiCardContent>
  </UiCard>
</template>
