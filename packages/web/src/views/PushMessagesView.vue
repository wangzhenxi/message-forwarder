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
        :scroll="{ x: 900 }"
        :row-key="rowKey"
        size="middle"
        class="message-table"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'receivedAt'">
            <span class="cell-primary">{{ formatDate(record.receivedAt) }}</span>
          </template>
          <template v-else-if="column.key === 'category'">
            <a-tag :color="categoryTagColor(record.category)" class="cell-secondary">{{ categoryLabel(record.category) }}</a-tag>
          </template>
          <template v-else-if="column.key === 'type'">
            <span class="cell-primary type-cell">{{ typeDisplay(record.type) }}</span>
          </template>
          <template v-else-if="column.key === 'messageSource'">
            <span class="cell-primary cell-ellipsis source-cell">{{ messageSource(record) }}</span>
          </template>
          <template v-else-if="column.key === 'messageContent'">
            <a-tooltip :title="messageContent(record)">
              <div class="cell-primary cell-ellipsis content-cell">{{ messageContent(record) }}</div>
            </a-tooltip>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button type="link" size="small" @click="showDetail(record)">详情</a-button>
          </template>
        </template>
      </a-table>
      <a-typography-text type="secondary" style="margin-top: 12px; display: block">
        共 {{ list.length }} 条。表格仅展示主要信息，需查看完整参数或原始数据请点击「详情」。
      </a-typography-text>
    </a-card>
    <a-modal
      v-model:open="detailVisible"
      title="消息详情"
      width="560px"
      :footer="null"
      wrap-class-name="message-detail-modal"
    >
      <div v-if="detailRecord" class="detail-content">
        <pre class="detail-json">{{ detailJson }}</pre>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
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

// 列顺序：接收时间、分类、类型、消息来源、消息内容、操作（设备 ID 已隐藏）
const columns: TableColumnType[] = [
  { title: '接收时间', dataIndex: 'receivedAt', key: 'receivedAt', width: 168 },
  { title: '分类', dataIndex: 'category', key: 'category', width: 100 },
  { title: '类型', dataIndex: 'type', key: 'type', width: 140 },
  { title: '消息来源', key: 'messageSource', width: 140, ellipsis: true },
  { title: '消息内容', key: 'messageContent', width: 260, ellipsis: true },
  { title: '操作', key: 'action', width: 72, fixed: 'right' },
];

const detailVisible = ref(false);
const detailRecord = ref<StoredPushMessage | null>(null);
const detailJson = computed(() =>
  detailRecord.value ? JSON.stringify(detailRecord.value, null, 2) : ''
);

function rowKey(record: StoredPushMessage, index: number) {
  return `${record.receivedAt}-${record.devId}-${record.type}-${index}`;
}

/** 类型中文说明，未在映射中的返回 null */
function typeDescription(type: number): string | null {
  const map: Record<number, string> = {
    100: 'WIFI已联网',
    101: 'SIM1已联网',
    102: 'SIM2已联网',
    202: 'SIM卡准备初始化',
    203: 'SIM卡IMSI上报',
    204: 'SIM卡已就绪',
    205: 'SIM卡已被取出',
    209: 'SIM卡错误',
    301: '通信模组异常',
    501: '新短信',
    502: '外发短信成功',
    601: '来电振铃',
    602: '来电接通',
    603: '来电挂断',
    620: '去电拨号',
    621: '去电振铃',
    622: '去电接通',
    623: '去电挂断',
    998: 'PING',
    999: '设备状态',
  };
  return map[type] ?? null;
}

/** 类型列展示：仅展示中文说明，未映射的显示 - */
function typeDisplay(type: number): string {
  const desc = typeDescription(type);
  return desc ?? '—';
}

/** 消息来源：短信/通话为号码，其它为空 */
function messageSource(m: StoredPushMessage): string {
  const type = m.type;
  const phNum = m.phNum != null ? String(m.phNum) : '';
  if (type === 501 && phNum) return phNum;
  if (type === 502 && phNum) return phNum;
  if ([601, 602, 603, 620, 621, 622, 623].includes(type) && phNum) return phNum;
  return '—';
}

/** 消息内容：501 新短信为短信正文，502 外发成功为短信正文或 tid，其它为 - */
function messageContent(m: StoredPushMessage): string {
  if (m.type === 501 && m.smsBd != null) return String(m.smsBd);
  if (m.type === 502) {
    if (m.smsBd != null && String(m.smsBd).trim() !== '') return String(m.smsBd);
    if (m.tid != null && String(m.tid).trim() !== '') return String(m.tid);
  }
  return '—';
}

function showDetail(record: StoredPushMessage) {
  detailRecord.value = record;
  detailVisible.value = true;
}

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
.message-table :deep(.cell-primary) {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.88);
}
.message-table :deep(.cell-secondary) {
  color: rgba(0, 0, 0, 0.55);
  font-size: 13px;
}
.cell-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}
.type-cell {
  white-space: nowrap;
}
.source-cell {
  max-width: 140px;
}
.content-cell {
  max-width: 260px;
}
.detail-content {
  text-align: left;
}
.detail-json {
  margin: 0;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 6px;
  font-size: 12px;
  max-height: 40vh;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
