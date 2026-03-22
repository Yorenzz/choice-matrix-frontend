<script setup lang="ts">
import { BasicPage } from '@/components/global-layout'

import { columns } from './components/columns'
import DataTable from './components/data-table.vue'
import TaskCreate from './components/task-create.vue'
import TaskImport from './components/task-import.vue'
import tasks from './data/tasks.json'
</script>

<template>
  <BasicPage
    title="决策列表 (Decisions)"
    description="查看与管理您创建的所有决策对比流"
    sticky
  >
    <template #actions>
      <TaskImport />
      <TaskCreate />
    </template>
    <div class="overflow-x-auto">
      <DataTable :data="tasks" :columns="columns" />
    </div>
  </BasicPage>
</template>
