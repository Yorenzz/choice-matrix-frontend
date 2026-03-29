<script setup lang="ts">
import { Eye, EyeOff } from 'lucide-vue-next'
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { useAuth } from '@/composables/use-auth'
import { RouterPath } from '@/constants/route-path'
import AuthShell from './components/AuthShell.vue'
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
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const handleRegister = () => {
  if (form.value.password !== form.value.confirmPassword) {
    toast.error('两次输入的密码不一致')
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
  <AuthShell
    eyebrow="New Decision Space"
    title="从第一个账号开始，建立你的决策系统。"
    description="把零散信息收拢进同一个结构里，之后每一次比较都会更快、更稳，也更容易解释。"
    compact
  >
    <template #brand>
      <AuthTitle />
    </template>

    <UiCard class="auth-card auth-card--compact">
      <UiCardHeader class="auth-card__header">
        <div class="auth-card__badge auth-card__badge--warm">
          创建账号
        </div>
        <div class="space-y-2">
          <UiCardTitle class="auth-card__title">
            开始你的第一张决策画布
          </UiCardTitle>
          <UiCardDescription class="auth-card__description">
            注册后会直接进入系统，你可以马上创建项目并开始整理自己的选择矩阵。
          </UiCardDescription>
        </div>
      </UiCardHeader>

      <UiCardContent>
        <form class="auth-form" @submit.prevent="handleRegister">
          <div class="auth-field">
            <UiLabel for="nickname" class="auth-field__label">
              用户昵称
            </UiLabel>
            <UiInput
              id="nickname"
              v-model="form.nickname"
              placeholder="例如 Yorenz"
              class="auth-input"
            />
          </div>

          <div class="auth-field">
            <UiLabel for="email" class="auth-field__label">
              邮箱地址
            </UiLabel>
            <UiInput
              id="email"
              v-model="form.email"
              type="email"
              placeholder="me@example.com"
              required
              class="auth-input"
            />
          </div>

          <div class="auth-field">
            <UiLabel for="password" class="auth-field__label">
              设置密码
            </UiLabel>
            <div class="relative">
              <UiInput
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="建议不少于 6 位"
                required
                class="auth-input auth-input--password"
              />
              <button
                type="button"
                class="auth-input__toggle"
                :aria-label="showPassword ? '隐藏密码' : '显示密码'"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" class="size-4" />
                <Eye v-else class="size-4" />
              </button>
            </div>
          </div>

          <div class="auth-field">
            <UiLabel for="confirm-password" class="auth-field__label">
              确认密码
            </UiLabel>
            <div class="relative">
              <UiInput
                id="confirm-password"
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="再次输入密码"
                required
                class="auth-input auth-input--password"
              />
              <button
                type="button"
                class="auth-input__toggle"
                :aria-label="showConfirmPassword ? '隐藏密码' : '显示密码'"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <EyeOff v-if="showConfirmPassword" class="size-4" />
                <Eye v-else class="size-4" />
              </button>
            </div>
          </div>

          <UiButton type="submit" class="auth-submit" :disabled="loading">
            <UiSpinner v-if="loading" class="mr-2" />
            创建并进入系统
          </UiButton>

          <UiButton
            type="button"
            variant="outline"
            class="h-11 w-full rounded-2xl border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-50"
            @click="$router.push(RouterPath.GUEST_MATRIX)"
          >
            先体验游客矩阵
          </UiButton>

          <UiSeparator label="或使用以下方式注册" class="auth-divider" />

          <div class="auth-socials">
            <GitHubButton />
            <GoogleButton />
          </div>

          <div class="auth-inline-note">
            已有账号？
            <UiButton
              type="button"
              variant="link"
              class="auth-inline-note__action"
              @click="$router.push('/auth/sign-in')"
            >
              直接登录
            </UiButton>
          </div>

          <UiCardDescription class="auth-legal">
            点击注册即表示你同意我们的
            <TermsOfServiceButton />
            和
            <PrivacyPolicyButton />
          </UiCardDescription>
        </form>
      </UiCardContent>
    </UiCard>
  </AuthShell>
</template>
