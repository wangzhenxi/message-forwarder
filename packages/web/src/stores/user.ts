import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/api';

export interface UserInfo {
  id: string;
  username: string;
  nickname: string;
  role: string;
  createdAt: string;
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') ?? '');
  const user = ref<UserInfo | null>(null);

  const isLoggedIn = computed(() => !!token.value);

  async function login(username: string, password: string) {
    const res = await api.post<{
      code: number;
      message?: string;
      data?: { token: string; user: UserInfo };
    }>('/user/login', {
      username,
      password,
    });
    if (res.data.code !== 0) {
      throw new Error(res.data.message ?? '登录失败');
    }
    const { token: t, user: u } = res.data.data!;
    token.value = t;
    user.value = u;
    localStorage.setItem('token', t);
  }

  function logout() {
    token.value = '';
    user.value = null;
    localStorage.removeItem('token');
  }

  return { token, user, isLoggedIn, login, logout };
});
