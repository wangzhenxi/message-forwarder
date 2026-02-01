import Router from 'koa-router';
import type { UserApplicationService } from '../../../application/user/user-application-service';
import type { LoginRateLimit } from '../../auth/login-rate-limit';
import type { TokenStore } from '../../auth/token-store';
import type { Context, Next } from 'koa';

export interface UserRouteDeps {
  userApp: UserApplicationService;
  authMiddleware: (ctx: Context, next: Next) => Promise<void>;
  loginRateLimit: LoginRateLimit;
  tokenStore: TokenStore;
}

export function createUserRoutes(deps: UserRouteDeps): Router {
  const { userApp, authMiddleware, loginRateLimit, tokenStore } = deps;
  const router = new Router({ prefix: '/api/user' });

  router.post('/login', async (ctx) => {
    const body = ctx.request.body as { username?: string; password?: string };
    if (!body?.username || !body?.password) {
      ctx.status = 400;
      ctx.body = { code: 400, message: '用户名和密码必填' };
      return;
    }
    const username = body.username;
    const lockMsg = loginRateLimit.checkLock(username);
    if (lockMsg) {
      ctx.status = 429;
      ctx.body = { code: 429, message: lockMsg };
      return;
    }
    const result = await userApp.login({
      username: body.username,
      password: body.password,
    });
    if (!result) {
      loginRateLimit.recordFailure(username);
      ctx.status = 401;
      ctx.body = { code: 401, message: '用户名或密码错误' };
      return;
    }
    loginRateLimit.recordSuccess(username);
    ctx.body = { code: 0, data: result };
  });

  router.post('/logout', authMiddleware, async (ctx) => {
    const token = (ctx.state as { token?: string }).token;
    if (token) tokenStore.delete(token);
    ctx.body = { code: 0, message: 'ok' };
  });

  router.get('/me', authMiddleware, async (ctx) => {
    const userId = (ctx.state as { userId?: string }).userId;
    if (!userId) {
      ctx.status = 401;
      ctx.body = { code: 401, message: '未登录' };
      return;
    }
    const user = await userApp.getCurrentUser(userId);
    if (!user) {
      ctx.status = 404;
      ctx.body = { code: 404, message: '用户不存在' };
      return;
    }
    ctx.body = { code: 0, data: user };
  });

  router.get('/list', authMiddleware, async (ctx) => {
    const result = await userApp.list();
    ctx.body = { code: 0, data: result };
  });

  router.patch('/profile', authMiddleware, async (ctx) => {
    const userId = (ctx.state as { userId?: string }).userId;
    if (!userId) {
      ctx.status = 401;
      ctx.body = { code: 401, message: '未登录' };
      return;
    }
    const body = ctx.request.body as { nickname?: string };
    const nickname = typeof body?.nickname === 'string' ? body.nickname.trim() : '';
    if (!nickname) {
      ctx.status = 400;
      ctx.body = { code: 400, message: '昵称不能为空' };
      return;
    }
    const user = await userApp.updateNickname(userId, nickname);
    if (!user) {
      ctx.status = 404;
      ctx.body = { code: 404, message: '用户不存在' };
      return;
    }
    ctx.body = { code: 0, data: user };
  });

  return router;
}
