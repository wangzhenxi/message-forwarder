import Router from 'koa-router';
import {
  parseFormBody,
  parseJsonBody,
  expandTemplate,
  type LvyatechMessage,
} from '@message-forwarder/lvyatech';
import type { PushMessageStore } from '../../persistence/push-message-store';
import { authMiddleware } from '../middleware/auth';

export interface LvyatechRouteDeps {
  pushMessageStore: PushMessageStore;
}

/**
 * 绿芽开发板推送接入（基于 docs/lvyatech）
 * - 接收 HTTP Form 或 JSON，解析为统一消息结构并存储
 * - 支持后台配置保留天数、定时清理、查询消息
 */
export function createLvyatechRoutes(deps: LvyatechRouteDeps): Router {
  const { pushMessageStore } = deps;
  const router = new Router({ prefix: '/api/lvyatech' });

  /**
   * 推送入口：开发板可配置此地址为 HTTP 接口
   * 支持 application/x-www-form-urlencoded 与 application/json，收到后写入当日 JSONL 文件
   */
  router.post('/push', async (ctx) => {
    const body = ctx.request.body;
    if (body === undefined || body === null) {
      ctx.status = 400;
      ctx.body = { code: 400, message: '请求体为空' };
      return;
    }
    let msg: LvyatechMessage;
    try {
      const contentType = ctx.request.headers['content-type'] ?? '';
      if (contentType.includes('application/json')) {
        msg = parseJsonBody(body);
      } else {
        const raw = body as Record<string, string | undefined>;
        msg = parseFormBody(raw);
      }
    } catch (e) {
      ctx.status = 400;
      ctx.body = { code: 400, message: '解析失败', error: (e as Error).message };
      return;
    }
    pushMessageStore.save(msg);
    ctx.body = { code: 0, message: 'ok', data: msg };
  });

  /**
   * 后台查询推送消息（需登录）
   * 查询参数：devId, type, from (YYYY-MM-DD), to (YYYY-MM-DD), limit (默认 100)
   */
  router.get('/messages', authMiddleware, async (ctx) => {
    const devId = ctx.query.devId as string | undefined;
    const typeStr = ctx.query.type as string | undefined;
    const from = ctx.query.from as string | undefined;
    const to = ctx.query.to as string | undefined;
    const limitStr = ctx.query.limit as string | undefined;
    const type = typeStr !== undefined && typeStr !== '' ? Number(typeStr) : undefined;
    const limit = limitStr !== undefined && limitStr !== '' ? Number(limitStr) : undefined;
    const list = pushMessageStore.findBy({ devId, type, from, to, limit });
    ctx.body = { code: 0, data: list };
  });

  /**
   * 获取推送消息配置（保留天数，需登录）
   */
  router.get('/settings', authMiddleware, async (ctx) => {
    ctx.body = { code: 0, data: { retainDays: pushMessageStore.getRetainDays() } };
  });

  /**
   * 设置推送消息保留天数（需登录），超过天数的按日文件会被定时清理
   */
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
   * 测试用：对给定模板做参数展开（body: { template, context? }）
   */
  router.post('/expand', async (ctx) => {
    const body = (ctx.request.body || {}) as { template?: string; context?: Record<string, string> };
    const { template, context } = body;
    if (typeof template !== 'string') {
      ctx.status = 400;
      ctx.body = { code: 400, message: '缺少 template 或非字符串' };
      return;
    }
    const ctxMap = context ?? {};
    const result = expandTemplate(template, ctxMap);
    ctx.body = { code: 0, data: { result } };
  });

  return router;
}
