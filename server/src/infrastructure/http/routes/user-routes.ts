import Router from 'koa-router';
import type { UserApplicationService } from '../../../application/user/user-application-service';
import { authMiddleware } from '../middleware/auth';

export function createUserRoutes(userApp: UserApplicationService): Router {
  const router = new Router({ prefix: '/api/user' });

  router.post('/login', async (ctx) => {
    const body = ctx.request.body as { username?: string; password?: string };
    if (!body?.username || !body?.password) {
      ctx.status = 400;
      ctx.body = { code: 400, message: '用户名和密码必填' };
      return;
    }
    const result = await userApp.login({
      username: body.username,
      password: body.password,
    });
    if (!result) {
      ctx.status = 401;
      ctx.body = { code: 401, message: '用户名或密码错误' };
      return;
    }
    ctx.body = { code: 0, data: result };
  });

  router.get('/list', authMiddleware, async (ctx) => {
    const result = await userApp.list();
    ctx.body = { code: 0, data: result };
  });

  return router;
}
