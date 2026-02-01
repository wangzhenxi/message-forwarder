<template>
  <div class="push-messages">
    <a-typography-title :level="4">推送消息</a-typography-title>
    <a-card style="margin-bottom: 20px">
      <a-form layout="inline" :model="filters" class="filters">
        <a-form-item label="分类">
          <a-select v-model:value="filters.category" placeholder="全部" allow-clear style="width: 140px">
            <a-select-option value="">全部</a-select-option>
            <a-select-option v-for="c in categories" :key="c.id" :value="c.id">{{ c.label }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="设备 ID">
          <a-input v-model:value="filters.devId" placeholder="devId" allow-clear style="width: 140px" />
        </a-form-item>
        <a-form-item label="消息类型">
          <a-input-number v-model:value="filters.type" placeholder="type" :min="0" style="width: 100px" />
        </a-form-item>
        <a-form-item label="日期起">
          <a-date-picker v-model:value="filters.fromDate" value-format="YYYY-MM-DD" style="width: 140px" />
        </a-form-item>
        <a-form-item label="日期止">
          <a-date-picker v-model:value="filters.toDate" value-format="YYYY-MM-DD" style="width: 140px" />
        </a-form-item>
        <a-form-item label="条数">
          <a-input-number v-model:value="filters.limit" :min="1" :max="500" style="width: 100px" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="fetchList">查询</a-button>
        </a-form-item>
      </a-form>
    </a-card>
    <a-card>
      <a-table
        :columns="columns"
        :data-source="list"
        :loading="loading"
        :pagination="false"
        :scroll="{ x: 800 }"
        row-key="receivedAt"
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'receivedAt'">
            {{ formatDate(record.receivedAt) }}
          </template>
          <template v-else-if="column.key === 'category'">
            <a-tag :color="categoryTagColor(record.category)">{{ categoryLabel(record.category) }}</a-tag>
          </template>
          <template v-else-if="column.key === 'extra'">
            <span v-for="(v, k) in extraKeys(record)" :key="k" class="kv">{{ k }}: {{ v }}</span>
          </template>
        </template>
      </a-table>
      <a-typography-text type="secondary" style="margin-top: 12px; display: block">
        共 {{ list.length }} 条
      </a-typography-text>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { getCategories, getMessages, type CategoryItem, type StoredPushMessage } from '@/api/lvyatech';
import type { TableColumnType } from 'ant-design-vue';

const categories = ref<CategoryItem[]>([]);
const list = ref<StoredPushMessage[]>([]);
const loading = ref(false);
const filters = reactive({
  category: '' as string,
  devId: '',
  type: undefined as number | undefined,
  fromDate: null as string | null,
  toDate: null as string | null,
  limit: 100,
});

const columns: TableColumnType[] = [
  { title: '接收时间', dataIndex: 'receivedAt', key: 'receivedAt', width: 180 },
  { title: '分类', dataIndex: 'category', key: 'category', width: 120 },
  { title: '类型', dataIndex: 'type', key: 'type', width: 80 },
  { title: '设备 ID', dataIndex: 'devId', key: 'devId', width: 120 },
  { title: '其它参数', key: 'extra', ellipsis: true },
];

function categoryLabel(id: string) {
  return categories.value.find((c) => c.id === id)?.label ?? id;
}

function categoryTagColor(cat: string) {
  const map: Record<string, string> = {
    'device-status': 'blue',
    call: 'green',
    sms: 'orange',
    other: 'default',
  };
  return map[cat] ?? 'default';
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
      type: filters.type,
      from: filters.fromDate || undefined,
      to: filters.toDate || undefined,
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
.filters {
  margin-bottom: 0;
}
.kv {
  display: inline-block;
  margin-right: 8px;
  margin-bottom: 4px;
  font-size: 12px;
  color: #666;
}
</style>
