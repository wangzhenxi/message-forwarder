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
        <a-dropdown trigger="hover">
          <div class="avatar" :title="userStore.user?.nickname ?? userStore.user?.username">
            {{ userInitial }}
          </div>
          <template #overlay>
            <a-menu @click="(e: { key: string }) => e.key === 'logout' && handleLogout()">
              <a-menu-item key="logout" danger>退出</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
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
const userInitial = computed(() => {
  const name = userStore.user?.nickname ?? userStore.user?.username ?? '';
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
});

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
  justify-content: flex-start;
  gap: 10px;
}
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
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
