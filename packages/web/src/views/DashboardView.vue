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
          <div class="chart-wrap">
            <Line v-if="chartData" :data="chartData" :options="chartOptions" />
          </div>
        </a-card>
      </template>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'vue-chartjs';
import { useUserStore } from '@/stores/user';
import { getDashboardStats, type DashboardStats } from '@/api/lvyatech';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const userStore = useUserStore();
const loading = ref(true);
const error = ref('');
const stats = ref<DashboardStats | null>(null);

const categoryOrder = ['device-status', 'sms', 'call', 'other'] as const;
const categoryLabels: Record<string, string> = {
  'device-status': '设备状态消息',
  call: '通话消息',
  sms: '短信消息',
  other: '其它消息',
};
const categoryColors: Record<string, string> = {
  'device-status': 'rgb(24, 144, 255)',
  sms: 'rgb(82, 196, 26)',
  call: 'rgb(250, 173, 20)',
  other: 'rgb(140, 140, 140)',
};

const chartData = computed(() => {
  const daily = stats.value?.daily;
  if (!daily?.length) return null;
  const labels = daily.map((d) => d.date);
  const datasets = categoryOrder.map((cat) => ({
    label: categoryLabels[cat] ?? cat,
    data: daily.map((d) => d.byCategory[cat] ?? 0),
    borderColor: categoryColors[cat] ?? 'rgb(140, 140, 140)',
    backgroundColor: 'transparent',
    tension: 0.2,
    fill: false,
  }));
  return { labels, datasets };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
    },
  },
  scales: {
    x: {
      title: { display: true, text: '日期' },
    },
    y: {
      beginAtZero: true,
      title: { display: true, text: '消息数' },
    },
  },
};

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
