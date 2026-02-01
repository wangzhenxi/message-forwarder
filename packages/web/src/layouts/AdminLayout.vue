<template>
  <a-layout class="admin-layout">
    <a-layout-sider v-model:collapsed="collapsed" theme="dark" :width="220">
      <div class="logo">管理后台</div>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        theme="dark"
        mode="inline"
        :items="menuItems"
        @click="onMenuClick"
      />
      <div class="user-bar">
        <span class="nickname">{{ userStore.user?.nickname ?? userStore.user?.username }}</span>
        <a-button type="text" size="small" class="logout" @click="handleLogout">退出</a-button>
      </div>
    </a-layout-sider>
    <a-layout>
      <a-layout-content class="main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import type { MenuProps } from 'ant-design-vue';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const collapsed = ref(false);
const selectedKeys = ref<string[]>([route.path]);

const menuItems: MenuProps['items'] = [
  { key: '/', label: '仪表盘' },
  { key: '/users', label: '用户列表' },
  { key: '/push-messages', label: '推送消息' },
  { key: '/push-messages/settings', label: '推送配置' },
  { key: '/control', label: '控制指令' },
];

watch(
  () => route.path,
  (path) => {
    selectedKeys.value = [path];
  },
  { immediate: true }
);

function onMenuClick({ key }: { key: string }) {
  router.push(key);
}

function handleLogout() {
  userStore.logout();
  router.push('/login');
}
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
}
.logo {
  height: 64px;
  line-height: 64px;
  padding: 0 20px;
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.user-bar {
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.nickname {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.75);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.logout {
  color: rgba(255, 255, 255, 0.65) !important;
}
.logout:hover {
  color: rgba(255, 255, 255, 0.9) !important;
}
.main {
  padding: 24px;
  overflow: auto;
  background: #f0f2f5;
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
