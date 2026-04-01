<script setup lang="ts">
import { Eye, EyeOff } from 'lucide-vue-next'
import { ref } from 'vue'
import { RouterPath } from '@/constants/route-path'
import { useAuth } from '@/composables/use-auth'

const { login, loading } = useAuth()
const form = ref({ email: '', password: '' })
const showPassword = ref(false)

const handleLogin = () => {
  login(form.value)
}
</script>

<template>
  <section class="auth-shell-page cm-page-shell relative box-border h-[100dvh] overflow-hidden">
    <div class="auth-shell__backdrop" aria-hidden="true">
      <div class="auth-shell__mesh" />
      <div class="auth-shell__spotlight auth-shell__spotlight--one" />
      <div class="auth-shell__spotlight auth-shell__spotlight--two" />
      <div class="auth-shell__orb auth-shell__orb--indigo" />
      <div class="auth-shell__orb auth-shell__orb--amber" />
      <div class="auth-shell__orb auth-shell__orb--teal" />
      <div class="auth-shell__orb auth-shell__orb--slate" />
      <div class="auth-shell__orb auth-shell__orb--coral" />
      <div class="auth-shell__particles" />
      <div class="auth-shell__grain" />
    </div>

    <div class="auth-shell-layout relative z-10 mx-auto flex h-full w-full max-w-md flex-col items-center justify-center gap-5 sm:max-w-lg sm:gap-6">
      <div class="w-full text-center">
        <p class="text-[0.72rem] font-semibold tracking-[0.28em] uppercase text-slate-500">
          Decision Studio
        </p>
        <h1 class="mt-2 font-display text-[1.8rem] font-semibold tracking-[-0.04em] text-slate-900 sm:text-[2rem]">
          ChoiceMatrix
        </h1>
      </div>

      <div class="cm-panel-glass w-full rounded-[2rem] border backdrop-blur-[22px]">
        <div class="grid gap-2 px-6 pt-5 pb-2 sm:px-8 sm:pt-6">
          <div class="space-y-2">
            <h3 class="font-display text-[1.25rem] font-semibold tracking-[-0.04em] text-slate-900 sm:text-[1.5rem]">
              登录
            </h3>
            <p class="text-[0.92rem] leading-[1.7] text-slate-500">
              输入邮箱和密码进入你的决策空间。
            </p>
          </div>
        </div>

        <form class="grid gap-4 px-6 pt-3 pb-5 sm:px-8 sm:pb-6" @submit.prevent="handleLogin">
          <div class="grid gap-[0.55rem]">
            <UiLabel for="email" class="text-[0.9rem] font-semibold text-slate-700">
              邮箱地址
            </UiLabel>
            <UiInput
              id="email"
              v-model="form.email"
              type="email"
              placeholder="me@example.com"
              required
              class="h-[3rem] rounded-2xl border-slate-200/90 bg-white/80 px-4 text-[0.96rem]"
              style="box-shadow: inset 0 1px 0 rgba(255,255,255,0.92)"
            />
          </div>

          <div class="grid gap-[0.55rem]">
            <div class="flex items-center justify-between gap-4">
              <UiLabel for="password" class="text-[0.9rem] font-semibold text-slate-700">
                密码
              </UiLabel>
              <UiButton
                type="button"
                variant="link"
                class="h-auto p-0 text-[0.82rem] font-semibold text-teal-700 hover:text-teal-900"
                @click="$router.push('/auth/forgot-password')"
              >
                忘记密码
              </UiButton>
            </div>
            <div class="relative">
              <UiInput
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="请输入密码"
                class="h-[3rem] rounded-2xl border-slate-200/90 bg-white/80 px-4 pr-12 text-[0.96rem]"
                style="box-shadow: inset 0 1px 0 rgba(255,255,255,0.92)"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-500 transition-colors duration-150 hover:text-slate-900"
                :aria-label="showPassword ? '隐藏密码' : '显示密码'"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" class="size-4" />
                <Eye v-else class="size-4" />
              </button>
            </div>
          </div>

          <UiButton
            type="submit"
            :disabled="loading"
            class="cm-button-primary h-[3rem] w-full rounded-2xl text-[0.96rem] font-semibold text-white transition-[transform,box-shadow] duration-150 hover:-translate-y-px active:translate-y-0"
          >
            <UiSpinner v-if="loading" class="mr-2" />
            进入 ChoiceMatrix
          </UiButton>

          <div class="flex min-h-[2.8rem] flex-wrap items-center justify-center gap-1 rounded-2xl bg-slate-50/80 px-4 py-2.5 text-center text-[0.9rem] text-slate-500">
            还没有账号？
            <UiButton
              type="button"
              variant="link"
              class="h-auto p-0 px-0.5 text-teal-700 font-semibold hover:text-teal-900"
              @click="$router.push(RouterPath.REGISTER)"
            >
              立即注册
            </UiButton>
          </div>

          <div class="flex flex-wrap items-center justify-center gap-1 text-center text-xs leading-relaxed text-slate-400">
            点击登录即表示你同意我们的
            <UiButton
              type="button"
              variant="link"
              class="h-auto p-0 text-[0.75rem] font-semibold text-teal-700 underline underline-offset-[3px] hover:text-teal-900"
            >
              服务条款
            </UiButton>
            和
            <UiButton
              type="button"
              variant="link"
              class="h-auto p-0 text-[0.75rem] font-semibold text-teal-700 underline underline-offset-[3px] hover:text-teal-900"
            >
              隐私政策
            </UiButton>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>
