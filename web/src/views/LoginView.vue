<template>
  <div class="login-page">
    <div class="card">
      <h1>管理后台</h1>
      <p class="subtitle">请登录</p>
      <form class="form" @submit.prevent="handleSubmit">
        <input
          v-model="username"
          type="text"
          placeholder="用户名"
          autocomplete="username"
          class="input"
        />
        <input
          v-model="password"
          type="password"
          placeholder="密码"
          autocomplete="current-password"
          class="input"
        />
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" class="btn" :disabled="loading">登录</button>
      </form>
      <p class="hint">演示账号：admin / admin123</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

async function handleSubmit() {
  error.value = '';
  if (!username.value || !password.value) {
    error.value = '请输入用户名和密码';
    return;
  }
  loading.value = true;
  try {
    await userStore.login(username.value, password.value);
    const redirect = (route.query.redirect as string) || '/';
    router.push(redirect);
  } catch (e) {
    error.value = '用户名或密码错误';
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
  background: linear-gradient(135deg, #1a1d24 0%, #2d323c 100%);
}
.card {
  width: 360px;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
}
.card h1 {
  font-size: 24px;
  margin-bottom: 8px;
  color: #1a1d24;
}
.subtitle {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 24px;
}
.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.input {
  padding: 12px 14px;
  font-size: 15px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  outline: none;
}
.input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}
.error {
  color: #dc2626;
  font-size: 14px;
}
.btn {
  padding: 12px;
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  background: #3b82f6;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.btn:hover:not(:disabled) {
  background: #2563eb;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.hint {
  margin-top: 16px;
  font-size: 13px;
  color: #9ca3af;
}
</style>
