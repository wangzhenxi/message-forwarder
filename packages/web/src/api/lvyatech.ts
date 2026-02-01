import { api } from './index';

export interface CategoryItem {
  id: string;
  label: string;
}

export interface StoredPushMessage {
  devId: string;
  type: number;
  receivedAt: string;
  category: string;
  [key: string]: string | number;
}

export interface MessagesQuery {
  category?: string;
  devId?: string;
  type?: string | number;
  from?: string;
  to?: string;
  limit?: number;
}

/** 仪表盘统计：近 N 天按日、按分类 */
export interface DashboardStats {
  days: number;
  daily: Array<{
    date: string;
    byCategory: Record<string, number>;
    total: number;
  }>;
  summary: {
    totalMessages: number;
    deviceCount: number;
  };
}

export function getDashboardStats(params?: { days?: number }) {
  return api.get<{ code: number; data: DashboardStats }>('/admin/lvyatech/dashboard-stats', { params });
}

export function getCategories() {
  return api.get<{ code: number; data: CategoryItem[] }>('/admin/lvyatech/categories');
}

export function getMessages(params?: MessagesQuery) {
  return api.get<{ code: number; data: StoredPushMessage[] }>('/admin/lvyatech/messages', { params });
}

export interface PushMessageSettings {
  retainDays: number;
  cleanupEnabled: boolean;
}

export function getSettings() {
  return api.get<{ code: number; data: PushMessageSettings }>('/admin/lvyatech/settings');
}

export function putSettings(settings: Partial<PushMessageSettings>) {
  return api.put<{ code: number; data: PushMessageSettings }>('/admin/lvyatech/settings', settings);
}

/** 控制指令：cmd 必填，其余为附加参数；设备地址与 token 由服务端配置文件或环境变量提供 */
export interface ControlPayload {
  cmd: string;
  [key: string]: unknown;
}

export function sendControl(payload: ControlPayload) {
  return api.post<{ code: number; data: unknown; _status?: number }>('/admin/lvyatech/control', payload);
}
