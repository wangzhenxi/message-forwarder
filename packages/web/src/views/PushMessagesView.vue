<template>
  <div class="push-messages">
    <h1 class="title">推送消息</h1>
    <div class="filters">
      <div class="filter-row">
        <label>分类</label>
        <select v-model="filters.category">
          <option value="">全部</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.label }}</option>
        </select>
        <label>设备 ID</label>
        <input v-model="filters.devId" type="text" placeholder="devId" />
        <label>消息类型</label>
        <input v-model.number="filters.type" type="number" placeholder="type" min="0" />
      </div>
      <div class="filter-row">
        <label>日期起</label>
        <input v-model="filters.from" type="date" />
        <label>日期止</label>
        <input v-model="filters.to" type="date" />
        <label>条数</label>
        <input v-model.number="filters.limit" type="number" min="1" max="500" />
        <button type="button" class="btn primary" @click="fetchList">查询</button>
      </div>
    </div>
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>接收时间</th>
            <th>分类</th>
            <th>类型</th>
            <th>设备 ID</th>
            <th>其它参数</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(m, i) in list" :key="i">
            <td>{{ formatDate(m.receivedAt) }}</td>
            <td><span class="cat" :class="m.category">{{ categoryLabel(m.category) }}</span></td>
            <td>{{ m.type }}</td>
            <td><code>{{ m.devId }}</code></td>
            <td class="extra">
              <span v-for="(v, k) in extraKeys(m)" :key="k" class="kv">{{ k }}: {{ v }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-if="loading" class="loading">加载中...</p>
    <p v-else class="total">共 {{ list.length }} 条</p>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { getCategories, getMessages, type CategoryItem, type StoredPushMessage } from '@/api/lvyatech';

const categories = ref<CategoryItem[]>([]);
const list = ref<StoredPushMessage[]>([]);
const loading = ref(false);
const filters = reactive({
  category: '',
  devId: '',
  type: '' as '' | number,
  from: '',
  to: '',
  limit: 100,
});

function categoryLabel(id: string) {
  return categories.value.find((c) => c.id === id)?.label ?? id;
}

function extraKeys(m: StoredPushMessage): Record<string, string | number> {
  const skip = new Set(['devId', 'type', 'receivedAt', 'category']);
  const out: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(m)) {
    if (!skip.has(k) && v !== undefined && v !== '') out[k] = v;
  }
  return out;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('zh-CN');
}

async function loadCategories() {
  const res = await getCategories();
  if (res.data.code === 0) categories.value = res.data.data;
}

async function fetchList() {
  loading.value = true;
  try {
    const params: Record<string, string | number | undefined> = {
      category: filters.category || undefined,
      devId: filters.devId || undefined,
      type: filters.type === '' ? undefined : filters.type,
      from: filters.from || undefined,
      to: filters.to || undefined,
      limit: filters.limit,
    };
    const res = await getMessages(params);
    if (res.data.code === 0) list.value = res.data.data;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadCategories();
  fetchList();
});
</script>

<style scoped>
.push-messages {
  max-width: 1200px;
}
.title {
  font-size: 24px;
  color: #1a1d24;
  margin-bottom: 20px;
}
.filters {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
.filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.filter-row:last-child {
  margin-bottom: 0;
}
.filters label {
  font-size: 13px;
  color: #6b7280;
  min-width: 56px;
}
.filters input,
.filters select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}
.filters input[type="text"],
.filters input[type="number"] {
  min-width: 100px;
}
.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid #d1d5db;
  background: #fff;
}
.btn.primary {
  background: #3b82f6;
  color: #fff;
  border-color: #3b82f6;
}
.btn.primary:hover {
  background: #2563eb;
}
.table-wrap {
  background: #fff;
  border-radius: 12px;
  overflow: auto;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
}
.table th,
.table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  font-size: 13px;
}
.table th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
}
.table tbody tr:hover {
  background: #f9fafb;
}
.cat {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
}
.cat.device-status { background: #dbeafe; color: #1d4ed8; }
.cat.call { background: #dcfce7; color: #166534; }
.cat.sms { background: #fef3c7; color: #92400e; }
.cat.other { background: #f3f4f6; color: #4b5563; }
.extra {
  max-width: 280px;
}
.kv {
  display: inline-block;
  margin-right: 8px;
  margin-bottom: 4px;
  font-size: 12px;
  color: #6b7280;
}
code {
  font-size: 12px;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
}
.loading,
.total {
  margin-top: 12px;
  color: #6b7280;
  font-size: 14px;
}
</style>
