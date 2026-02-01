import Router from 'koa-router';
import {
  parseFormBody,
  parseJsonBody,
  expandTemplate,
  type LvyatechMessage,
} from '@message-forwarder/lvyatech';

/**
 * 绿亚开发板推送接入（基于 docs/lvyatech）
 * - 接收 HTTP Form 或 JSON，解析为统一消息结构
 * - 可选：按模板展开后转发（如钉钉 webhook）
 */
export function createDeviceRoutes(): Router {
  const router = new Router({ prefix: '/api/device' });

  /**
   * 推送入口：开发板可配置此地址为 HTTP 接口
   * 支持 application/x-www-form-urlencoded 与 application/json
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
        // form 或 urlencoded
        const raw = body as Record<string, string | undefined>;
        msg = parseFormBody(raw);
      }
    } catch (e) {
      ctx.status = 400;
      ctx.body = { code: 400, message: '解析失败', error: (e as Error).message };
      return;
    }
    ctx.body = { code: 0, message: 'ok', data: msg };
  });

  /**
   * 测试用：对给定模板做参数展开（body: { template, context? }）
   * 若不传 context，可用 /push 收到的消息体作为 context 做联调
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
