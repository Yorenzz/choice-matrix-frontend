<script lang="ts" setup>
import { Paintbrush } from 'lucide-vue-next'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import ContentLayout from './content-layout.vue'
import CustomColor from './custom-color.vue'
import CustomRadius from './custom-radius.vue'
import CustomThemeTitle from './custom-theme-title.vue'
import ToggleColorMode from './toggle-color-mode.vue'

withDefaults(defineProps<{
  triggerClass?: string
}>(), {
  triggerClass: '',
})
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        size="icon"
        :class="triggerClass || 'h-9 w-9 rounded-xl border-slate-200 bg-white'"
      >
        <Paintbrush class="size-4" />
      </Button>
    </PopoverTrigger>
    <PopoverContent align="end" class="w-[320px] rounded-[1.5rem] border-white/80 bg-white/92 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-[20px]">
      <CustomThemeTitle />
      <CustomColor />
      <CustomRadius />
      <ToggleColorMode />
      <ContentLayout />
    </PopoverContent>
  </Popover>
</template>
