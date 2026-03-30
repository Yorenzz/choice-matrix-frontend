<script setup lang="ts">
import type { User } from './types'

import {
  BadgeCheck,
  ChevronsUpDown,
  LogOut,
  Palette,
  ShieldCheck,
  UserRoundCog,
} from 'lucide-vue-next'

import ThemePopover from '@/components/custom-theme/theme-popover.vue'
import ToggleTheme from '@/components/toggle-theme.vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'

const { user } = defineProps<
  { user: User }
>()

const { logout } = useAuth()
const { isMobile, open } = useSidebar()
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            size="lg"
            class="rounded-2xl border border-transparent px-2.5 py-2 transition-all data-[state=open]:border-white/80 data-[state=open]:bg-white/80 data-[state=open]:text-slate-900"
          >
            <Avatar class="size-9 rounded-xl ring-1 ring-slate-200/80">
              <AvatarImage :src="user.avatar" :alt="user.name" />
              <AvatarFallback class="rounded-xl bg-slate-900 text-xs font-semibold text-white">
                CN
              </AvatarFallback>
            </Avatar>
            <div class="grid flex-1 text-left">
              <span class="truncate text-sm font-semibold text-slate-900">{{ user.name }}</span>
              <span class="truncate text-[0.72rem] text-slate-500">{{ user.email }}</span>
            </div>
            <ChevronsUpDown class="ml-auto size-4 text-slate-400" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-(--radix-dropdown-menu-trigger-width) min-w-78 rounded-[1.75rem] border border-white/80 bg-white/92 p-2 shadow-[0_28px_90px_rgba(15,23,42,0.14)] backdrop-blur-[24px]"
          :side="(isMobile || open) ? 'bottom' : 'right'"
          align="start"
          :side-offset="8"
        >
          <DropdownMenuLabel class="p-0 font-normal">
            <div class="rounded-[1.35rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.92),rgba(255,255,255,0.98))] px-3 py-3.5">
              <div class="flex items-center gap-3 text-left">
                <Avatar class="size-11 rounded-2xl ring-1 ring-slate-200/80">
                  <AvatarImage :src="user.avatar" :alt="user.name" />
                  <AvatarFallback class="rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                    CN
                  </AvatarFallback>
                </Avatar>
                <div class="grid min-w-0 flex-1 gap-0.5">
                  <span class="truncate text-sm font-semibold text-slate-900">{{ user.name }}</span>
                  <span class="truncate text-xs text-slate-500">{{ user.email }}</span>
                </div>
              </div>
            </div>
          </DropdownMenuLabel>

          <div class="px-1 pt-3 pb-1">
            <div class="flex items-center gap-2 text-[0.68rem] font-semibold tracking-[0.22em] text-slate-400 uppercase">
              <ShieldCheck class="size-3.5" />
              账户
            </div>
          </div>
          <DropdownMenuGroup>
            <DropdownMenuItem class="rounded-2xl px-3 py-2.5 text-sm text-slate-700" @click="$router.push('/profile')">
              <UserRoundCog class="size-4 text-slate-500" />
              个人中心
            </DropdownMenuItem>
            <DropdownMenuItem class="rounded-2xl px-3 py-2.5 text-sm text-slate-700" @click="$router.push('/profile')">
              <BadgeCheck class="size-4 text-slate-500" />
              账号信息
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator class="my-2 bg-slate-200/80" />
          <div class="grid gap-2 px-1 py-1">
            <div class="flex items-center gap-2 px-2 text-[0.68rem] font-semibold tracking-[0.22em] text-slate-400 uppercase">
              <Palette class="size-3.5" />
              外观设置
            </div>
            <div class="rounded-[1.35rem] border border-slate-200/80 bg-slate-50/90 p-2">
              <div class="flex items-center justify-between gap-3 rounded-2xl px-2 py-1.5">
                <div class="grid gap-0.5">
                  <span class="text-sm font-medium text-slate-800">黑色模式</span>
                  <span class="text-xs text-slate-500">切换浅色、深色或跟随系统</span>
                </div>
                <ToggleTheme trigger-class="h-10 w-10 rounded-2xl border-slate-200 bg-white shadow-none" />
              </div>
              <div class="mt-1 flex items-center justify-between gap-3 rounded-2xl px-2 py-1.5">
                <div class="grid gap-0.5">
                  <span class="text-sm font-medium text-slate-800">主题样式</span>
                  <span class="text-xs text-slate-500">调整主色、圆角和内容布局</span>
                </div>
                <ThemePopover trigger-class="h-10 w-10 rounded-2xl border-slate-200 bg-white shadow-none" />
              </div>
            </div>
          </div>

          <DropdownMenuSeparator class="my-2 bg-slate-200/80" />
          <DropdownMenuItem class="rounded-2xl px-3 py-2.5 text-sm text-rose-600 focus:text-rose-700" @click="logout">
            <LogOut class="size-4" />
            退出登录
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
