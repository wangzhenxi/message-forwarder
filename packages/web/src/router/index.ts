import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'Login', component: () => import('@/views/LoginView.vue'), meta: { public: true } },
    {
      path: '/',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'Dashboard', component: () => import('@/views/DashboardView.vue') },
        { path: 'users', name: 'UserList', component: () => import('@/views/UserListView.vue') },
        { path: 'push-messages', name: 'PushMessages', component: () => import('@/views/PushMessagesView.vue') },
        { path: 'push-messages/settings', name: 'PushMessageSettings', component: () => import('@/views/PushMessageSettingsView.vue') },
        { path: 'control', name: 'ControlCommand', component: () => import('@/views/ControlCommandView.vue') },
      ],
    },
  ],
});

router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore();
  if (to.meta.public) {
    if (userStore.token) return next({ path: '/' });
    return next();
  }
  if (to.meta.requiresAuth && !userStore.token) {
    return next({ path: '/login', query: { redirect: to.fullPath } });
  }
  // 有 token 但无 user（如刷新页面）时拉取当前用户，保证昵称等能正确显示
  if (to.meta.requiresAuth && userStore.token && !userStore.user) {
    await userStore.fetchUser();
    if (!userStore.token) return next({ path: '/login', query: { redirect: to.fullPath } });
  }
  next();
});

export default router;
