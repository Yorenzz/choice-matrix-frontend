<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/use-auth'
import AuthTitle from './components/AuthTitle.vue'
import GitHubButton from './components/GithubButton.vue'
import GoogleButton from './components/GoogleButton.vue'
import PrivacyPolicyButton from './components/PrivacyPolicyButton.vue'
import TermsOfServiceButton from './components/TermsOfServiceButton.vue'

const { register, loading } = useAuth()
const form = ref({
  nickname: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const handleRegister = () => {
  if (form.value.password !== form.value.confirmPassword) {
    alert('两次输入的密码不一致！')
    return
  }
  register({
    email: form.value.email,
    password: form.value.password,
    nickname: form.value.nickname,
  })
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen p-4 w-[100vw] bg-slate-50 relative overflow-hidden">
    <!-- 炫光背景效果 (反转方向，强化色彩) -->
    <div class="absolute -top-[5%] -right-[5%] w-[48vw] h-[48vw] rounded-full bg-violet-500/30 blur-[100px] pointer-events-none" />
    <div class="absolute -bottom-[5%] -left-[5%] w-[48vw] h-[48vw] rounded-full bg-indigo-500/30 blur-[100px] pointer-events-none" />
    
    <main class="flex flex-col gap-8 z-10 w-full max-w-sm">
      <div class="flex justify-center">
        <AuthTitle />
      </div>
      <UiCard class="w-full max-w-sm rounded-[2rem] shadow-2xl shadow-indigo-900/10 border border-white/60 !bg-white/40 backdrop-blur-2xl mx-auto">
        <UiCardHeader>
          <UiCardTitle class="text-2xl font-bold tracking-tight text-slate-900">
            创建新账号
          </UiCardTitle>
          <UiCardDescription class="text-slate-500 mt-2">
            完善以下信息进行注册，开始您的智能决策之旅。
            <br>
            <span class="mt-2 block">
              已有账号？
              <UiButton
                variant="link" class="px-0 text-indigo-600 font-semibold"
                @click="$router.push('/auth/sign-in')"
              >
                直接登录
              </UiButton>
            </span>
          </UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
          <div class="grid gap-4">
            <div class="grid gap-2">
              <UiLabel for="nickname" class="text-slate-700">
                用户昵称
              </UiLabel>
              <UiInput id="nickname" v-model="form.nickname" placeholder="请输入您的昵称" required class="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20" />
            </div>
            <div class="grid gap-2">
              <UiLabel for="email" class="text-slate-700">
                邮箱地址
              </UiLabel>
              <UiInput
                id="email"
                v-model="form.email"
                type="email"
                placeholder="输入真实邮箱... (例: me@example.com)"
                required
                class="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20"
              />
            </div>
            <div class="grid gap-2">
              <UiLabel for="password" class="text-slate-700">
                设置密码
              </UiLabel>
              <UiInput id="password" v-model="form.password" type="password" placeholder="推荐不少于 6 位数" required class="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20" />
            </div>
            <div class="grid gap-2">
              <UiLabel for="confirm-password" class="text-slate-700">
                确认密码
              </UiLabel>
              <UiInput id="confirm-password" v-model="form.confirmPassword" type="password" placeholder="再次输入密码" required class="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20" />
            </div>
            <UiButton type="submit" class="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all text-white shadow-md shadow-indigo-600/20" :disabled="loading" @click="handleRegister">
              <UiSpinner v-if="loading" class="mr-2" />
              注册账号
            </UiButton>

            <UiSeparator label="或通过以下方式注册" class="my-2" />

            <div class="flex flex-col items-center justify-between gap-4">
              <GitHubButton />
              <GoogleButton />
            </div>

            <UiCardDescription class="text-center text-xs mt-2 text-slate-400">
              点击注册即表示您同意我们的
              <TermsOfServiceButton class="text-indigo-600 hover:underline" />
              与
              <PrivacyPolicyButton class="text-indigo-600 hover:underline" />
            </UiCardDescription>
          </div>
        </UiCardContent>
      </UiCard>
    </main>
  </div>
</template>
