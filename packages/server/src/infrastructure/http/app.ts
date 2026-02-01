import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import { registerRoutes } from './routes';
import { UserApplicationService } from '../../application/user/user-application-service';
import { FileUserRepository } from '../persistence/file-user-repository';
import { PushMessageStore } from '../persistence/push-message-store';

const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24h

export function createApp(): Koa {
  const app = new Koa();
  const userRepo = new FileUserRepository();
  const userApp = new UserApplicationService(userRepo);
  const pushMessageStore = new PushMessageStore();

  pushMessageStore.runCleanup();
  setInterval(() => pushMessageStore.runCleanup(), CLEANUP_INTERVAL_MS);

  app.use(cors({ credentials: true }));
  app.use(bodyParser());
  registerRoutes(app, { userApp, pushMessageStore });

  return app;
}
