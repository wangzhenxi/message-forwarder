import type Koa from 'koa';
import type Router from 'koa-router';
import type { Context, Next } from 'koa';
import type { UserApplicationService } from '../../../application/user/user-application-service';
import type { PushMessageStore } from '../../persistence/push-message-store';
import type { TokenStore } from '../../auth/token-store';
import type { LoginRateLimit } from '../../auth/login-rate-limit';
import { createUserRoutes } from './user-routes';
import { createLvyatechDeviceRoutes } from './lvyatech-device-routes';
import { createLvyatechAdminRoutes } from './lvyatech-admin-routes';

export interface RouteDeps {
  userApp: UserApplicationService;
  pushMessageStore: PushMessageStore;
  authMiddleware: (ctx: Context, next: Next) => Promise<void>;
  loginRateLimit: LoginRateLimit;
  tokenStore: TokenStore;
}

/**
 * 集中注册所有路由。新增路由时：
 * 1. 在 routes 下新增 xxx-routes.ts 并导出 createXxxRoutes
 * 2. 在本文件顶部 import，并在下方注册（无需改 app.ts）
 */
export function registerRoutes(app: Koa, deps: RouteDeps): void {
  const userDeps = {
    userApp: deps.userApp,
    authMiddleware: deps.authMiddleware,
    loginRateLimit: deps.loginRateLimit,
    tokenStore: deps.tokenStore,
  };
  const lvyatechDeps = { pushMessageStore: deps.pushMessageStore, authMiddleware: deps.authMiddleware };
  const routers: Router[] = [
    createUserRoutes(userDeps),
    createLvyatechDeviceRoutes({ pushMessageStore: deps.pushMessageStore }),
    createLvyatechAdminRoutes(lvyatechDeps),
  ];
  for (const router of routers) {
    app.use(router.routes());
    app.use(router.allowedMethods());
  }
}
