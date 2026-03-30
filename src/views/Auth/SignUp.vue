<script setup lang="ts">
import { Eye, EyeOff } from 'lucide-vue-next'
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { RouterPath } from '@/constants/route-path'
import { useAuth } from '@/composables/use-auth'

const { register, loading } = useAuth()
const form = ref({ nickname: '', email: '', password: '', confirmPassword: '' })
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const handleRegister = () => {
  if (form.value.password !== form.value.confirmPassword) {
    toast.error('两次输入的密码不一致')
    return
  }

  register({ email: form.value.email, password: form.value.password, nickname: form.value.nickname })
}
</script>

<template>
  <section class="auth-shell-page relative box-border h-[100dvh] overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(14,116,144,0.16),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.12),_transparent_26%),linear-gradient(135deg,_#f4f7f6_0%,_#f7f9fc_48%,_#fbf7f1_100%)]">
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

      <div
        class="w-full rounded-[2rem] border border-white/80 backdrop-blur-[22px]"
        style="background: linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,255,255,0.84)); box-shadow: 0 28px 90px rgba(15,23,42,0.12), inset 0 1px 0 rgba(255,255,255,0.88)"
      >
        <div class="grid gap-2 px-6 pt-5 pb-2 sm:px-8 sm:pt-6">
          <div class="space-y-1.5">
            <h3 class="font-display text-[1.25rem] font-semibold tracking-[-0.04em] text-slate-900 sm:text-[1.5rem]">
              注册
            </h3>
            <p class="text-[0.92rem] leading-[1.7] text-slate-500">
              创建账号后就能开始保存矩阵、同步项目并继续你的判断过程。
            </p>
          </div>
        </div>

        <form class="grid gap-3 px-6 pt-3 pb-5 sm:px-8 sm:pb-6" @submit.prevent="handleRegister">
          <div class="grid gap-[0.5rem]">
            <UiLabel for="nickname" class="text-[0.9rem] font-semibold text-slate-700">
              用户昵称
            </UiLabel>
            <UiInput
              id="nickname"
              v-model="form.nickname"
              placeholder="例如 Yorenz"
              class="h-[2.85rem] rounded-2xl border-slate-200/90 bg-white/80 px-4 text-[0.96rem]"
              style="box-shadow: inset 0 1px 0 rgba(255,255,255,0.92)"
            />
          </div>

          <div class="grid gap-[0.5rem]">
            <UiLabel for="email" class="text-[0.9rem] font-semibold text-slate-700">
              邮箱地址
            </UiLabel>
            <UiInput
              id="email"
              v-model="form.email"
              type="email"
              placeholder="me@example.com"
              required
              class="h-[2.85rem] rounded-2xl border-slate-200/90 bg-white/80 px-4 text-[0.96rem]"
              style="box-shadow: inset 0 1px 0 rgba(255,255,255,0.92)"
            />
          </div>

          <div class="grid gap-[0.5rem]">
            <UiLabel for="password" class="text-[0.9rem] font-semibold text-slate-700">
              设置密码
            </UiLabel>
            <div class="relative">
              <UiInput
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="建议不少于 6 位"
                required
                class="h-[2.85rem] rounded-2xl border-slate-200/90 bg-white/80 px-4 pr-12 text-[0.96rem]"
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

          <div class="grid gap-[0.5rem]">
            <UiLabel for="confirm-password" class="text-[0.9rem] font-semibold text-slate-700">
              确认密码
            </UiLabel>
            <div class="relative">
              <UiInput
                id="confirm-password"
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="再次输入密码"
                required
                class="h-[2.85rem] rounded-2xl border-slate-200/90 bg-white/80 px-4 pr-12 text-[0.96rem]"
                style="box-shadow: inset 0 1px 0 rgba(255,255,255,0.92)"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-500 transition-colors duration-150 hover:text-slate-900"
                :aria-label="showConfirmPassword ? '隐藏密码' : '显示密码'"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <EyeOff v-if="showConfirmPassword" class="size-4" />
                <Eye v-else class="size-4" />
              </button>
            </div>
          </div>

          <UiButton
            type="submit"
            :disabled="loading"
            class="h-[2.95rem] w-full rounded-2xl text-[0.96rem] font-semibold text-white transition-[transform,box-shadow] duration-150 hover:-translate-y-px active:translate-y-0"
            style="background: linear-gradient(135deg,#0f172a 0%,#1f2937 100%); box-shadow: 0 20px 40px rgba(15,23,42,0.18)"
          >
            <UiSpinner v-if="loading" class="mr-2" />
            创建并进入系统
          </UiButton>

          <div class="flex min-h-[2.8rem] flex-wrap items-center justify-center gap-1 rounded-2xl bg-slate-50/80 px-4 py-2 text-center text-[0.88rem] text-slate-500">
            已有账号？
            <UiButton
              type="button"
              variant="link"
              class="h-auto p-0 px-0.5 text-teal-700 font-semibold hover:text-teal-900"
              @click="$router.push(RouterPath.LOGIN)"
            >
              直接登录
            </UiButton>
          </div>

          <div class="flex flex-wrap items-center justify-center gap-1 text-center text-xs leading-relaxed text-slate-400">
            点击注册即表示你同意我们的
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
