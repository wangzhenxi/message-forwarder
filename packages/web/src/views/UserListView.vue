<template>
  <div class="user-list">
    <h1 class="title">用户列表</h1>
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>用户名</th>
            <th>昵称</th>
            <th>角色</th>
            <th>创建时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in list" :key="u.id">
            <td>{{ u.id }}</td>
            <td>{{ u.username }}</td>
            <td>{{ u.nickname }}</td>
            <td><span class="role" :class="u.role">{{ u.role }}</span></td>
            <td>{{ formatDate(u.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-if="loading" class="loading">加载中...</p>
    <p v-else class="total">共 {{ total }} 条</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '@/api';

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
.title {
  font-size: 24px;
  color: #1a1d24;
  margin-bottom: 20px;
}
.table-wrap {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
.table {
  width: 100%;
  border-collapse: collapse;
}
.table th,
.table td {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}
.table th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  font-size: 13px;
}
.table tbody tr:hover {
  background: #f9fafb;
}
.role {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
}
.role.admin {
  background: #dbeafe;
  color: #1d4ed8;
}
.role.user {
  background: #f3f4f6;
  color: #4b5563;
}
.loading,
.total {
  margin-top: 12px;
  color: #6b7280;
  font-size: 14px;
}
</style>
