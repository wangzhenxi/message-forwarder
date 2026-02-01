<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="logo">管理后台</div>
      <nav class="nav">
        <router-link to="/" exact-active-class="active">仪表盘</router-link>
        <router-link to="/users" exact-active-class="active">用户列表</router-link>
        <router-link to="/push-messages" active-class="active">推送消息</router-link>
        <router-link to="/push-messages/settings" active-class="active">推送配置</router-link>
        <router-link to="/control" exact-active-class="active">控制指令</router-link>
      </nav>
      <div class="user-bar">
        <span class="nickname">{{ userStore.user?.nickname ?? userStore.user?.username }}</span>
        <button type="button" class="logout" @click="handleLogout">退出</button>
      </div>
    </aside>
    <main class="main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();

function handleLogout() {
  userStore.logout();
  router.push('/login');
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}
.sidebar {
  width: 220px;
  background: #1a1d24;
  color: #e4e6eb;
  display: flex;
  flex-direction: column;
}
.logo {
  padding: 20px;
  font-size: 18px;
  font-weight: 600;
  border-bottom: 1px solid #2c3038;
}
.nav {
  flex: 1;
  padding: 16px 0;
}
.nav a {
  display: block;
  padding: 12px 20px;
  color: #b0b3b8;
  text-decoration: none;
  transition: color 0.2s, background 0.2s;
}
.nav a:hover {
  color: #fff;
  background: rgba(255,255,255,0.06);
}
.nav a.active {
  color: #fff;
  background: rgba(59, 130, 246, 0.2);
  border-left: 3px solid #3b82f6;
}
.user-bar {
  padding: 16px 20px;
  border-top: 1px solid #2c3038;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.nickname {
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.logout {
  padding: 6px 12px;
  font-size: 13px;
  color: #b0b3b8;
  background: transparent;
  border: 1px solid #3c4048;
  border-radius: 6px;
  cursor: pointer;
}
.logout:hover {
  color: #fff;
  border-color: #5c6068;
}
.main {
  flex: 1;
  padding: 24px;
  overflow: auto;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
