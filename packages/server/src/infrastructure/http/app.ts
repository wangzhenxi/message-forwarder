import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import { createUserRoutes } from './routes/user-routes';
import { createExternalRoutes } from './routes/external-routes';
import { createDeviceRoutes } from './routes/device-routes';
import { UserApplicationService } from '../../application/user/user-application-service';
import { FileUserRepository } from '../persistence/file-user-repository';

export function createApp(): Koa {
  const app = new Koa();
  const userRepo = new FileUserRepository();
  const userApp = new UserApplicationService(userRepo);

  app.use(cors({ credentials: true }));
  app.use(bodyParser());
  const userRoutes = createUserRoutes(userApp);
  const externalRoutes = createExternalRoutes();
  const deviceRoutes = createDeviceRoutes();
  app.use(userRoutes.routes());
  app.use(userRoutes.allowedMethods());
  app.use(externalRoutes.routes());
  app.use(externalRoutes.allowedMethods());
  app.use(deviceRoutes.routes());
  app.use(deviceRoutes.allowedMethods());

  return app;
}
