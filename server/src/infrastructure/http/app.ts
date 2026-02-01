import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import { createUserRoutes } from './routes/user-routes';
import { UserApplicationService } from '../../application/user/user-application-service';
import { InMemoryUserRepository } from '../persistence/in-memory-user-repository';

export function createApp(): Koa {
  const app = new Koa();
  const userRepo = new InMemoryUserRepository();
  const userApp = new UserApplicationService(userRepo);

  app.use(cors({ credentials: true }));
  app.use(bodyParser());
  app.use(createUserRoutes(userApp).routes());
  app.use(createUserRoutes(userApp).allowedMethods());

  return app;
}
