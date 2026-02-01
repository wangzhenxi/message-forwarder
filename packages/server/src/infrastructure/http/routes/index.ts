import type Koa from 'koa';
import type Router from 'koa-router';
import type { UserApplicationService } from '../../../application/user/user-application-service';
import type { PushMessageStore } from '../../persistence/push-message-store';
import { createUserRoutes } from './user-routes';
import { createLvyatechDeviceRoutes } from './lvyatech-device-routes';
import { createLvyatechAdminRoutes } from './lvyatech-admin-routes';

export interface RouteDeps {
  userApp: UserApplicationService;
  pushMessageStore: PushMessageStore;
}

/**
 * 集中注册所有路由。新增路由时：
 * 1. 在 routes 下新增 xxx-routes.ts 并导出 createXxxRoutes
 * 2. 在本文件顶部 import，并在下方注册（无需改 app.ts）
 */
export function registerRoutes(app: Koa, deps: RouteDeps): void {
  const lvyatechDeps = { pushMessageStore: deps.pushMessageStore };
  const routers: Router[] = [
    createUserRoutes(deps.userApp),
    createLvyatechDeviceRoutes(lvyatechDeps),
    createLvyatechAdminRoutes(lvyatechDeps),
  ];
  for (const router of routers) {
    app.use(router.routes());
    app.use(router.allowedMethods());
  }
}
