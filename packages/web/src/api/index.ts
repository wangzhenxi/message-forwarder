import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // 登录/退出接口返回 401 时由调用方自行处理，不跳转
    const url = err.config?.url ?? '';
    const skipRedirect = url === '/user/login' || url === '/user/logout';
    if (err.response?.status === 401 && !skipRedirect) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);
