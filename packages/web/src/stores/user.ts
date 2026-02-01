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

  async function logout() {
    try {
      await api.post('/user/logout');
    } catch {
      // 无论成功失败都清空本地
    } finally {
      token.value = '';
      user.value = null;
      localStorage.removeItem('token');
    }
  }

  async function fetchUser() {
    if (!token.value) return;
    try {
      const res = await api.get<{ code: number; data?: UserInfo }>('/user/me');
      if (res.data.code === 0 && res.data.data) {
        user.value = res.data.data;
      } else {
        token.value = '';
        user.value = null;
        localStorage.removeItem('token');
      }
    } catch {
      token.value = '';
      user.value = null;
      localStorage.removeItem('token');
    }
  }

  async function updateNickname(nickname: string) {
    const res = await api.patch<{ code: number; data?: UserInfo }>('/user/profile', { nickname });
    if (res.data.code === 0 && res.data.data) {
      user.value = res.data.data;
      return res.data.data;
    }
    throw new Error((res.data as { message?: string }).message ?? '修改失败');
  }

  return { token, user, isLoggedIn, login, logout, fetchUser, updateNickname };
});
