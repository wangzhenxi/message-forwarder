<template>
  <div class="push-settings">
    <h1 class="title">推送消息配置</h1>
    <div class="card">
      <div class="field">
        <label class="checkbox-label">
          <input v-model="cleanupEnabled" type="checkbox" />
          <span>启用推送消息定时清理</span>
        </label>
        <p class="hint">开启后，将按保留天数在启动时及每 24 小时自动删除过期按日数据文件；关闭后不再自动清理。</p>
      </div>
      <div class="field">
        <label>保留天数</label>
        <p class="hint">超过该天数的按日数据文件会在定时清理时被删除（仅当已启用定时清理时生效）</p>
        <input v-model.number="retainDays" type="number" min="1" max="365" />
      </div>
      <button type="button" class="btn primary" :disabled="saving" @click="save">保存</button>
      <p v-if="message" class="message" :class="messageType">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getSettings, putSettings } from '@/api/lvyatech';

const retainDays = ref(7);
const cleanupEnabled = ref(false);
const saving = ref(false);
const message = ref('');
const messageType = ref<'ok' | 'err'>('ok');

async function load() {
  const res = await getSettings();
  if (res.data.code === 0) {
    retainDays.value = res.data.data.retainDays;
    cleanupEnabled.value = res.data.data.cleanupEnabled;
  }
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
    const res = await putSettings({ retainDays: days, cleanupEnabled: cleanupEnabled.value });
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
.checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin: 0;
  cursor: pointer;
}
.hint {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 12px;
}
.field input[type="number"] {
  width: 120px;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  margin-right: 12px;
}
.btn {
  margin-top: 8px;
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
