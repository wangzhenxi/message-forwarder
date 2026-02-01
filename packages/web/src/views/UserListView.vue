<template>
  <div class="user-list">
    <a-typography-title :level="4">用户列表</a-typography-title>
    <a-card>
      <a-table
        :columns="columns"
        :data-source="list"
        :loading="loading"
        :pagination="false"
        row-key="id"
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'role'">
            <a-tag :color="record.role === 'admin' ? 'blue' : 'default'">{{ record.role }}</a-tag>
          </template>
          <template v-else-if="column.key === 'createdAt'">
            {{ formatDate(record.createdAt) }}
          </template>
        </template>
      </a-table>
      <a-typography-text type="secondary" style="margin-top: 12px; display: block">
        共 {{ total }} 条
      </a-typography-text>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '@/api';
import type { TableColumnType } from 'ant-design-vue';

interface UserItem {
  id: string;
  username: string;
  nickname: string;
  role: string;
  createdAt: string;
}

const list = ref<UserItem[]>([]);
const total = ref(0);
const loading = ref(false);

const columns: TableColumnType[] = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 120 },
  { title: '用户名', dataIndex: 'username', key: 'username' },
  { title: '昵称', dataIndex: 'nickname', key: 'nickname' },
  { title: '角色', dataIndex: 'role', key: 'role', width: 100 },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 180 },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('zh-CN');
}

async function fetchList() {
  loading.value = true;
  try {
    const res = await api.get<{ code: number; data: { list: UserItem[]; total: number } }>('/user/list');
    if (res.data.code === 0) {
      list.value = res.data.data.list;
      total.value = res.data.data.total;
    }
  } finally {
    loading.value = false;
  }
}

onMounted(fetchList);
</script>

<style scoped>
.user-list {
  max-width: 960px;
}
</style>
