<script lang="ts" setup>
import { Eye, EyeOff } from 'lucide-vue-next'
import { ref } from 'vue'
import { useAuth } from '@/composables/use-auth'
import { RouterPath } from '@/constants/route-path'
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
const showPassword = ref(false)

const handleLogin = () => {
  login(form.value)
}
</script>

<template>
  <UiCard class="auth-card">
    <UiCardHeader class="auth-card__header">
      <div class="auth-card__badge">
        欢迎回来
      </div>
      <div class="space-y-2">
        <UiCardTitle class="auth-card__title">
          登录你的决策工作台
        </UiCardTitle>
        <UiCardDescription class="auth-card__description">
          继续查看你的矩阵、项目进度和 AI 总结，把上一次的判断接着做完。
        </UiCardDescription>
      </div>
    </UiCardHeader>

    <UiCardContent>
      <form class="auth-form" @submit.prevent="handleLogin">
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
          <div class="auth-field__row">
            <UiLabel for="password" class="auth-field__label">
              密码
            </UiLabel>
            <ToForgotPasswordLink />
          </div>

          <div class="relative">
            <UiInput
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="请输入密码"
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

        <UiButton type="submit" class="auth-submit" :disabled="loading">
          <UiSpinner v-if="loading" class="mr-2" />
          进入 ChoiceMatrix
        </UiButton>

        <UiButton
          type="button"
          variant="outline"
          class="h-11 w-full rounded-2xl border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-50"
          @click="$router.push(RouterPath.GUEST_MATRIX)"
        >
          先体验游客矩阵
        </UiButton>

        <UiSeparator label="或使用以下方式继续" class="auth-divider" />

        <div class="auth-socials">
          <GitHubButton />
          <GoogleButton />
        </div>

        <div class="auth-inline-note">
          还没有账号？
          <UiButton
            type="button"
            variant="link"
            class="auth-inline-note__action"
            @click="$router.push('/auth/sign-up')"
          >
            立即注册
          </UiButton>
        </div>

        <UiCardDescription class="auth-legal">
          点击登录即表示你同意我们的
          <TermsOfServiceButton />
          和
          <PrivacyPolicyButton />
        </UiCardDescription>
      </form>
    </UiCardContent>
  </UiCard>
</template>
