<template>
  <div class="login-page">
    <a-card class="card" title="管理后台">
      <template #extra>
        <a-typography-text type="secondary">请登录</a-typography-text>
      </template>
      <a-form
        :model="formState"
        layout="vertical"
        @submit.prevent="handleSubmit"
      >
        <a-form-item label="用户名" name="username" :rules="[{ required: true, message: '请输入用户名' }]">
          <a-input
            v-model:value="formState.username"
            placeholder="用户名"
            autocomplete="username"
            size="large"
          />
        </a-form-item>
        <a-form-item label="密码" name="password" :rules="[{ required: true, message: '请输入密码' }]">
          <a-input-password
            v-model:value="formState.password"
            placeholder="密码"
            autocomplete="current-password"
            size="large"
          />
        </a-form-item>
        <a-alert v-if="error" type="error" :message="error" show-icon style="margin-bottom: 16px" />
        <a-form-item>
          <a-button type="primary" html-type="submit" size="large" block :loading="loading">
            登录
          </a-button>
        </a-form-item>
      </a-form>
      <a-typography-text type="secondary" style="font-size: 13px">
        无默认账号，可在 packages/server/data/user/users.json 中添加用户
      </a-typography-text>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const formState = reactive({
  username: '',
  password: '',
});
const error = ref('');
const loading = ref(false);

function getErrorMessage(e: unknown): string {
  if (e instanceof Error && e.message) return e.message;
  const err = e as { response?: { data?: { message?: string } }; message?: string };
  return err.response?.data?.message ?? err.message ?? '登录失败，请稍后重试';
}

async function handleSubmit() {
  error.value = '';
  if (!formState.username || !formState.password) {
    const msg = '请输入用户名和密码';
    error.value = msg;
    message.error(msg);
    return;
  }
  loading.value = true;
  try {
    await userStore.login(formState.username, formState.password);
    const redirect = (route.query.redirect as string) || '/';
    router.push(redirect);
  } catch (e) {
    const msg = getErrorMessage(e);
    error.value = msg;
    message.error(msg);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #001529 0%, #002140 100%);
}
.card {
  width: 400px;
}
</style>
