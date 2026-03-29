<script setup lang="ts">
import { computed } from 'vue'
import { BasicPage } from '@/components/global-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()

const user = computed(() => authStore.userInfo)
const profileName = computed(() => user.value?.nickname || '未设置昵称')
const initials = computed(() => (profileName.value || user.value?.email || 'CM').slice(0, 2).toUpperCase())
const locationText = computed(() => {
  const parts = [user.value?.country_code, user.value?.region_name, user.value?.city_name].filter(Boolean)
  return parts.length ? parts.join(' / ') : '暂无地区信息'
})
const lastLoginAtText = computed(() => {
  if (!user.value?.last_login_at) {
    return '暂无登录记录'
  }

  const date = new Date(user.value.last_login_at)
  if (Number.isNaN(date.getTime())) {
    return user.value.last_login_at
  }

  return date.toLocaleString('zh-CN', { hour12: false })
})
</script>

<template>
  <BasicPage
    title="个人中心"
    description="查看当前账号资料、套餐状态和最近一次登录环境。"
    sticky
  >
    <template #actions>
      <Button variant="outline" @click="authStore.fetchCurrentUser">
        刷新资料
      </Button>
    </template>

    <div class="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <Card class="rounded-2xl border-slate-200">
        <CardHeader>
          <CardTitle>账号资料</CardTitle>
          <CardDescription>当前登录账号的基础信息与登录环境。</CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="flex items-center gap-4">
            <div class="flex size-14 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-semibold text-white">
              {{ initials }}
            </div>
            <div class="space-y-1">
              <p class="text-lg font-semibold text-slate-900">
                {{ profileName }}
              </p>
              <p class="text-sm text-slate-500">
                {{ user?.email || '暂无邮箱' }}
              </p>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="rounded-2xl bg-slate-50 p-4">
              <p class="text-sm text-slate-500">用户 ID</p>
              <p class="mt-2 text-base font-semibold text-slate-900">{{ user?.id ?? '--' }}</p>
            </div>
            <div class="rounded-2xl bg-slate-50 p-4">
              <p class="text-sm text-slate-500">账号状态</p>
              <p class="mt-2 text-base font-semibold text-slate-900">{{ user?.status ?? '--' }}</p>
            </div>
            <div class="rounded-2xl bg-slate-50 p-4">
              <p class="text-sm text-slate-500">最近登录时间</p>
              <p class="mt-2 text-base font-semibold text-slate-900">{{ lastLoginAtText }}</p>
            </div>
            <div class="rounded-2xl bg-slate-50 p-4">
              <p class="text-sm text-slate-500">最近登录 IP</p>
              <p class="mt-2 break-all text-base font-semibold text-slate-900">{{ user?.last_login_ip || '--' }}</p>
            </div>
            <div class="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
              <p class="text-sm text-slate-500">国家 / 地区</p>
              <p class="mt-2 text-base font-semibold text-slate-900">{{ locationText }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="rounded-2xl border-slate-200">
        <CardHeader>
          <CardTitle>套餐与额度</CardTitle>
          <CardDescription>这里展示当前套餐和 AI 点数信息。</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
            <span class="text-sm text-slate-500">会员等级</span>
            <Badge :variant="user?.pro ? 'default' : 'secondary'">
              {{ user?.plan?.toUpperCase() || 'FREE' }}
            </Badge>
          </div>

          <div class="rounded-2xl bg-slate-50 p-4">
            <p class="text-sm text-slate-500">AI 点数余额</p>
            <p class="mt-2 text-2xl font-semibold text-slate-900">{{ user?.credits ?? 0 }}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  </BasicPage>
</template>
