<template>
  <div class="push-settings">
    <a-typography-title :level="4">推送消息配置</a-typography-title>
    <a-card>
      <a-form layout="vertical" :style="{ maxWidth: 480 }">
        <a-form-item label="启用推送消息定时清理">
          <a-switch v-model:checked="cleanupEnabled" />
          <a-typography-text type="secondary" style="display: block; margin-top: 8px">
            开启后，将按保留天数在启动时及每 24 小时自动删除过期按日数据文件；关闭后不再自动清理。
          </a-typography-text>
        </a-form-item>
        <a-form-item label="保留天数">
          <a-typography-text type="secondary" style="display: block; margin-bottom: 8px">
            超过该天数的按日数据文件会在定时清理时被删除（仅当已启用定时清理时生效）
          </a-typography-text>
          <a-input-number v-model:value="retainDays" :min="1" :max="365" style="width: 120px" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" :loading="saving" @click="save">保存</a-button>
        </a-form-item>
        <a-alert v-if="message" :message="message" :type="messageType" show-icon style="margin-top: 16px" />
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getSettings, putSettings } from '@/api/lvyatech';

const retainDays = ref(7);
const cleanupEnabled = ref(false);
const saving = ref(false);
const message = ref('');
const messageType = ref<'success' | 'error'>('success');

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
    messageType.value = 'error';
    return;
  }
  saving.value = true;
  message.value = '';
  try {
    const res = await putSettings({ retainDays: days, cleanupEnabled: cleanupEnabled.value });
    if (res.data.code === 0) {
      message.value = '已保存';
      messageType.value = 'success';
    } else {
      message.value = '保存失败';
      messageType.value = 'error';
    }
  } catch {
    message.value = '请求失败';
    messageType.value = 'error';
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
</style>
