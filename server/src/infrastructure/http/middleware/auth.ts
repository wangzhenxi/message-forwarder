import type { Context, Next } from 'koa';

/**
 * 简易认证中间件：校验请求头 Authorization: Bearer <token>
 */
export async function authMiddleware(ctx: Context, next: Next): Promise<void> {
  const auth = ctx.get('Authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) {
    ctx.status = 401;
    ctx.body = { code: 401, message: '未登录' };
    return;
  }
  (ctx.state as { token?: string }).token = token;
  await next();
}
