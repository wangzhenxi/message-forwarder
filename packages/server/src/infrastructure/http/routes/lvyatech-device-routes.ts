import Router from 'koa-router';
import {
  parseFormBody,
  parseJsonBody,
  expandTemplate,
  type LvyatechMessage,
} from '@message-forwarder/lvyatech';
import type { PushMessageStore } from '../../persistence/push-message-store';

export interface LvyatechDeviceRouteDeps {
  pushMessageStore: PushMessageStore;
}

/**
 * 绿芽开发板调用（无鉴权）
 * - POST /api/lvyatech/push：推送入口
 * - POST /api/lvyatech/expand：测试用模板展开
 */
export function createLvyatechDeviceRoutes(deps: LvyatechDeviceRouteDeps): Router {
  const { pushMessageStore } = deps;
  const router = new Router({ prefix: '/api/lvyatech' });

  router.post('/push', async (ctx) => {
    const body = ctx.request.body;
    const contentType = ctx.request.headers['content-type'] ?? '';
    const receivedAt = new Date().toISOString();
    // 先存储原始请求体，便于后续 debug（含空体、解析失败等情况）
    pushMessageStore.saveRawPayload(receivedAt, contentType, body ?? null);

    if (body === undefined || body === null) {
      ctx.status = 400;
      ctx.body = { code: 400, message: '请求体为空' };
      return;
    }
    let msg: LvyatechMessage;
    try {
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
