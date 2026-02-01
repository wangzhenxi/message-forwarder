import type { Context, Next } from 'koa';
import type { TokenStore } from '../../auth/token-store';

/**
 * 认证中间件：校验 Authorization: Bearer <token>，并在内存 token 存储中校验，防止伪造
 * 校验通过后设置 ctx.state.userId
 */
export function createAuthMiddleware(tokenStore: TokenStore) {
  return async function authMiddleware(ctx: Context, next: Next): Promise<void> {
    const auth = ctx.get('Authorization');
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) {
      ctx.status = 401;
      ctx.body = { code: 401, message: '未登录' };
      return;
    }
    const userId = tokenStore.get(token);
    if (!userId) {
      ctx.status = 401;
      ctx.body = { code: 401, message: '登录已失效或 token 无效' };
      return;
    }
    (ctx.state as { token?: string; userId?: string }).token = token;
    (ctx.state as { userId?: string }).userId = userId;
    await next();
  };
}
