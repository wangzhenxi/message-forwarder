import Router from 'koa-router';
import type { PushMessageStore } from '../../persistence/push-message-store';
import { authMiddleware } from '../middleware/auth';
import { PUSH_MESSAGE_CATEGORIES } from '@message-forwarder/lvyatech';
import { readDataConfig } from '../../persistence/data-config';

export interface LvyatechAdminRouteDeps {
  pushMessageStore: PushMessageStore;
}

/**
 * 绿芽管理后台调用（需登录）
 * - 推送消息查询、配置、控制指令下发
 */
export function createLvyatechAdminRoutes(deps: LvyatechAdminRouteDeps): Router {
  const { pushMessageStore } = deps;
  const router = new Router({ prefix: '/api/admin/lvyatech' });

  /** 推送消息分类列表（供前端筛选用） */
  router.get('/categories', authMiddleware, async (ctx) => {
    ctx.body = {
      code: 0,
      data: PUSH_MESSAGE_CATEGORIES.map((id) => ({
        id,
        label: categoryLabel(id),
      })),
    };
  });

  /** 查询推送消息：category, devId, type, from, to, limit */
  router.get('/messages', authMiddleware, async (ctx) => {
    const category = ctx.query.category as string | undefined;
    const devId = ctx.query.devId as string | undefined;
    const typeStr = ctx.query.type as string | undefined;
    const from = ctx.query.from as string | undefined;
    const to = ctx.query.to as string | undefined;
    const limitStr = ctx.query.limit as string | undefined;
    const type = typeStr !== undefined && typeStr !== '' ? Number(typeStr) : undefined;
    const limit = limitStr !== undefined && limitStr !== '' ? Number(limitStr) : undefined;
    const list = pushMessageStore.findBy({ category, devId, type, from, to, limit });
    ctx.body = { code: 0, data: list };
  });

  /** 获取推送消息配置（保留天数） */
  router.get('/settings', authMiddleware, async (ctx) => {
    ctx.body = { code: 0, data: { retainDays: pushMessageStore.getRetainDays() } };
  });

  /** 设置推送消息保留天数 */
  router.put('/settings', authMiddleware, async (ctx) => {
    const body = (ctx.request.body || {}) as { retainDays?: number };
    const retainDays = body.retainDays;
    if (typeof retainDays !== 'number' || retainDays < 1) {
      ctx.status = 400;
      ctx.body = { code: 400, message: 'retainDays 须为正整数' };
      return;
    }
    pushMessageStore.setRetainDays(retainDays);
    ctx.body = { code: 0, message: 'ok', data: { retainDays } };
  });

  /**
   * 向开发板下发控制指令（代理到设备 /ctrl 接口）
   * 设备地址与 token 从 data/config.json（lvyatech_deviceUrl、lvyatech_token）或环境变量 LVYATECH_DEVICE_URL、LVYATECH_DEVICE_TOKEN 读取；body 可仅传 cmd 与附加参数
   */
  router.post('/control', authMiddleware, async (ctx) => {
    const body = (ctx.request.body || {}) as Record<string, unknown>;
    const { deviceUrl: bodyUrl, token: bodyToken, cmd, ...rest } = body;
    const cfg = readDataConfig();
    const configUrl = typeof cfg.lvyatech_deviceUrl === 'string' ? cfg.lvyatech_deviceUrl.trim() : '';
    const configToken = typeof cfg.lvyatech_token === 'string' ? cfg.lvyatech_token.trim() : '';
    const deviceUrl = (typeof bodyUrl === 'string' && bodyUrl.trim()) || process.env.LVYATECH_DEVICE_URL || configUrl;
    const token = (typeof bodyToken === 'string' && bodyToken.trim()) || process.env.LVYATECH_DEVICE_TOKEN || configToken;
    if (!deviceUrl) {
      ctx.status = 400;
      ctx.body = { code: 400, message: '请先配置设备地址：编辑 data/config.json（lvyatech_deviceUrl）或设置环境变量 LVYATECH_DEVICE_URL' };
      return;
    }
    if (typeof cmd !== 'string' || !cmd) {
      ctx.status = 400;
      ctx.body = { code: 400, message: 'cmd 必填' };
      return;
    }
    const base = deviceUrl.replace(/\/+$/, '');
    const ctrlUrl = base.includes('/ctrl') ? base : `${base}/ctrl`;
    const params = new URLSearchParams();
    if (token) params.set('token', token);
    params.set('cmd', cmd);
    for (const [k, v] of Object.entries(rest)) {
      if (v !== undefined && v !== null && v !== '') {
        params.set(k, String(v));
      }
    }
    const url = `${ctrlUrl}?${params.toString()}`;
    try {
      const res = await fetch(url, { method: 'GET' });
      const text = await res.text();
      let data: unknown = text;
      try {
        data = JSON.parse(text);
      } catch {
        // 非 JSON 则原样返回
      }
      ctx.body = { code: 0, data, _status: res.status };
    } catch (e) {
      ctx.status = 502;
      ctx.body = {
        code: 502,
        message: '控制指令请求失败',
        error: (e as Error).message,
      };
    }
  });

  return router;
}

function categoryLabel(id: string): string {
  const map: Record<string, string> = {
    'device-status': '设备状态消息',
    call: '通话消息',
    sms: '短信消息',
    other: '其它消息',
  };
  return map[id] ?? id;
}
