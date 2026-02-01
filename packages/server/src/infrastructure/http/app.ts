import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import { config } from '../../config';
import { registerRoutes } from './routes';
import { UserApplicationService } from '../../application/user/user-application-service';
import { FileUserRepository } from '../persistence/file-user-repository';
import { PushMessageStore } from '../persistence/push-message-store';

export function createApp(): Koa {
  const app = new Koa();
  const userRepo = new FileUserRepository();
  const userApp = new UserApplicationService(userRepo);
  const pushMessageStore = new PushMessageStore();

  if (config.pushMessageCleanupEnabled) {
    pushMessageStore.runCleanup();
    setInterval(() => pushMessageStore.runCleanup(), config.pushMessageCleanupIntervalMs);
  }

  app.use(cors({ credentials: true }));
  app.use(bodyParser());
  registerRoutes(app, { userApp, pushMessageStore });

  return app;
}
