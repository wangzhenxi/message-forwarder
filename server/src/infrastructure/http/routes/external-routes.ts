import Router from 'koa-router';
import { externalApiClient } from '../external-api-client';
import { authMiddleware } from '../middleware/auth';

/**
 * 外部接口转发或封装，路径与 DTO 见 docs/external-api.md
 */
export function createExternalRoutes(): Router {
  const router = new Router({ prefix: '/api/external' });

  // 示例：GET 某列表（请按文档替换路径与类型）
  router.get('/example', authMiddleware, async (ctx) => {
    try {
      const data = await externalApiClient.get<unknown>('/api/example/list');
      ctx.body = { code: 0, data };
    } catch (e) {
      ctx.status = 502;
      ctx.body = { code: 502, message: '外部接口调用失败', error: (e as Error).message };
    }
  });

  // 示例：POST 提交（请按文档替换路径与 body 类型）
  router.post('/example', authMiddleware, async (ctx) => {
    try {
      const body = ctx.request.body as Record<string, unknown>;
      const data = await externalApiClient.post<unknown>('/api/example/submit', body);
      ctx.body = { code: 0, data };
    } catch (e) {
      ctx.status = 502;
      ctx.body = { code: 502, message: '外部接口调用失败', error: (e as Error).message };
    }
  });

  return router;
}
