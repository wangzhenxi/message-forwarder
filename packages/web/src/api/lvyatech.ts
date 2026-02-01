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
