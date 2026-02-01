<template>
  <div class="dashboard">
    <a-typography-title :level="4">仪表盘</a-typography-title>
    <a-typography-text type="secondary">欢迎回来，{{ userStore.user?.nickname ?? userStore.user?.username }}。</a-typography-text>
    <a-spin :spinning="loading" style="display: block; margin-top: 16px">
      <a-alert v-if="error" type="error" :message="error" show-icon style="margin-bottom: 16px" />
      <template v-else>
        <a-row :gutter="[16, 16]" style="margin-bottom: 20px">
          <a-col :xs="24" :sm="12" :md="8">
            <a-card>
              <a-statistic title="近 30 日总消息数" :value="stats?.summary.totalMessages ?? 0" />
            </a-card>
          </a-col>
          <a-col :xs="24" :sm="12" :md="8">
            <a-card>
              <a-statistic title="活跃设备数" :value="stats?.summary.deviceCount ?? 0" />
            </a-card>
          </a-col>
        </a-row>
        <a-card title="每日消息数量（按分类）">
          <div ref="chartContainerRef" class="chart-wrap"></div>
        </a-card>
      </template>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { Chart } from '@antv/g2';
import { useUserStore } from '@/stores/user';
import { getDashboardStats, type DashboardStats } from '@/api/lvyatech';

const userStore = useUserStore();
const loading = ref(true);
const error = ref('');
const stats = ref<DashboardStats | null>(null);
const chartContainerRef = ref<HTMLDivElement | null>(null);
let chart: Chart | null = null;

const categoryOrder = ['device-status', 'sms', 'call', 'other'] as const;
const categoryLabels: Record<string, string> = {
  'device-status': '设备状态消息',
  call: '通话消息',
  sms: '短信消息',
  other: '其它消息',
};

/** 转为 G2 多系列折线图所需扁平数据：{ date, category, value }[] */
const chartData = computed(() => {
  const daily = stats.value?.daily;
  if (!daily?.length) return [];
  const rows: { date: string; category: string; value: number }[] = [];
  for (const d of daily) {
    for (const cat of categoryOrder) {
      rows.push({
        date: d.date,
        category: categoryLabels[cat] ?? cat,
        value: d.byCategory[cat] ?? 0,
      });
    }
  }
  return rows;
});

function renderChart() {
  if (!chartContainerRef.value || !chartData.value.length) return;
  if (chart) {
    chart.destroy();
    chart = null;
  }
  chart = new Chart({
    container: chartContainerRef.value,
    autoFit: true,
  });
  chart
    .line()
    .data(chartData.value)
    .encode('x', 'date')
    .encode('y', 'value')
    .encode('color', 'category')
    .encode('shape', 'smooth')
    .axis('x', {
      title: '日期',
      tickCount: 5,
      labelAutoRotate: false,
    })
    .axis('y', { title: '消息数' })
    .legend('color', { position: 'top' });
  chart.render();
}

watch(chartData, (data) => {
  if (data.length) {
    nextTick(() => renderChart());
  }
}, { flush: 'post' });

onUnmounted(() => {
  if (chart) {
    chart.destroy();
    chart = null;
  }
});

async function loadStats() {
  loading.value = true;
  error.value = '';
  try {
    const res = await getDashboardStats({ days: 30 });
    if (res.data.code === 0 && res.data.data) {
      stats.value = res.data.data;
    } else {
      error.value = '获取统计数据失败';
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败';
  } finally {
    loading.value = false;
  }
}

onMounted(loadStats);
</script>

<style scoped>
.dashboard {
  max-width: 1000px;
}
.chart-wrap {
  height: 320px;
  position: relative;
}
</style>
