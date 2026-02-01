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

export function getSettings() {
  return api.get<{ code: number; data: { retainDays: number } }>('/admin/lvyatech/settings');
}

export function putSettings(retainDays: number) {
  return api.put<{ code: number; data: { retainDays: number } }>('/admin/lvyatech/settings', { retainDays });
}

export interface ControlPayload {
  deviceUrl: string;
  token?: string;
  cmd: string;
  [key: string]: unknown;
}

export function sendControl(payload: ControlPayload) {
  return api.post<{ code: number; data: unknown; _status?: number }>('/admin/lvyatech/control', payload);
}
