<template>
  <div class="dashboard">
    <h1 class="title">仪表盘</h1>
    <p class="welcome">欢迎回来，{{ userStore.user?.nickname ?? userStore.user?.username }}。</p>
    <div class="cards">
      <div class="card">
        <div class="card-title">快捷入口</div>
        <div class="links">
          <router-link to="/users" class="link">用户列表</router-link>
          <router-link to="/push-messages" class="link">推送消息</router-link>
          <router-link to="/push-messages/settings" class="link">推送配置</router-link>
          <router-link to="/control" class="link">控制指令</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
</script>

<style scoped>
.dashboard {
  max-width: 900px;
}
.title {
  font-size: 24px;
  color: #1a1d24;
  margin-bottom: 8px;
}
.welcome {
  color: #6b7280;
  margin-bottom: 24px;
}
.cards {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  min-width: 260px;
}
.card-title {
  font-weight: 600;
  color: #374151;
  margin-bottom: 16px;
}
.links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.link {
  color: #3b82f6;
  text-decoration: none;
}
.link:hover {
  text-decoration: underline;
}
</style>
