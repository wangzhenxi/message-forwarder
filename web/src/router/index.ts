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
      ],
    },
  ],
});

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore();
  if (to.meta.public) {
    if (userStore.token) return next({ path: '/' });
    return next();
  }
  if (to.meta.requiresAuth && !userStore.token) {
    return next({ path: '/login', query: { redirect: to.fullPath } });
  }
  next();
});

export default router;
