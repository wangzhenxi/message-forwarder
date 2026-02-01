<template>
  <div class="push-settings">
    <h1 class="title">推送消息配置</h1>
    <div class="card">
      <div class="field">
        <label>保留天数</label>
        <p class="hint">超过天数的按日数据文件会被定时清理（启动时及每 24 小时执行）</p>
        <input v-model.number="retainDays" type="number" min="1" max="365" />
        <button type="button" class="btn primary" :disabled="saving" @click="save">保存</button>
      </div>
      <p v-if="message" class="message" :class="messageType">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getSettings, putSettings } from '@/api/lvyatech';

const retainDays = ref(7);
const saving = ref(false);
const message = ref('');
const messageType = ref<'ok' | 'err'>('ok');

async function load() {
  const res = await getSettings();
  if (res.data.code === 0) retainDays.value = res.data.data.retainDays;
}

async function save() {
  const days = retainDays.value;
  if (days < 1 || days > 365) {
    message.value = '保留天数须在 1～365 之间';
    messageType.value = 'err';
    return;
  }
  saving.value = true;
  message.value = '';
  try {
    const res = await putSettings(days);
    if (res.data.code === 0) {
      message.value = '已保存';
      messageType.value = 'ok';
    } else {
      message.value = '保存失败';
      messageType.value = 'err';
    }
  } catch {
    message.value = '请求失败';
    messageType.value = 'err';
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.push-settings {
  max-width: 560px;
}
.title {
  font-size: 24px;
  color: #1a1d24;
  margin-bottom: 20px;
}
.card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
.field label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}
.hint {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 12px;
}
.field input {
  width: 120px;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  margin-right: 12px;
}
.btn {
  padding: 10px 20px;
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
.btn.primary:hover:not(:disabled) {
  background: #2563eb;
}
.btn.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.message {
  margin-top: 16px;
  font-size: 14px;
}
.message.ok {
  color: #059669;
}
.message.err {
  color: #dc2626;
}
</style>
