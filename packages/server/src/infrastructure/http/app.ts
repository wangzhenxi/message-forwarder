import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import { registerRoutes } from './routes';
import { UserApplicationService } from '../../application/user/user-application-service';
import { FileUserRepository } from '../persistence/file-user-repository';

export function createApp(): Koa {
  const app = new Koa();
  const userRepo = new FileUserRepository();
  const userApp = new UserApplicationService(userRepo);

  app.use(cors({ credentials: true }));
  app.use(bodyParser());
  registerRoutes(app, { userApp });

  return app;
}
