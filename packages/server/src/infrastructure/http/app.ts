import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import { config } from '../../config';
import { registerRoutes } from './routes';
import { UserApplicationService } from '../../application/user/user-application-service';
import { FileUserRepository } from '../persistence/file-user-repository';
import { PushMessageStore } from '../persistence/push-message-store';
import { TokenStore } from '../auth/token-store';
import { LoginRateLimit } from '../auth/login-rate-limit';
import { createAuthMiddleware } from './middleware/auth';

export function createApp(): Koa {
  const app = new Koa();
  const tokenStore = new TokenStore();
  const loginRateLimit = new LoginRateLimit();
  const authMiddleware = createAuthMiddleware(tokenStore);
  const userRepo = new FileUserRepository();
  const userApp = new UserApplicationService(userRepo, tokenStore);
  const pushMessageStore = new PushMessageStore();

  if (pushMessageStore.getCleanupEnabled()) {
    pushMessageStore.runCleanup();
  }
  setInterval(() => {
    if (pushMessageStore.getCleanupEnabled()) pushMessageStore.runCleanup();
  }, config.pushMessageCleanupIntervalMs);

  app.use(cors({ credentials: true }));
  app.use(bodyParser());
  registerRoutes(app, {
    userApp,
    pushMessageStore,
    authMiddleware,
    loginRateLimit,
    tokenStore,
  });

  return app;
}
