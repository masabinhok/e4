import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { setupApp } from './app.setup';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Rate limits key on req.ip. Behind proxies, set TRUST_PROXY_HOPS to the number of
  // proxies in front of the app, so req.ip is the client and not a spoofable header value.
  app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS ?? 0));
  const configService = app.get(ConfigService);
  // No CORS: browsers reach the API same-origin through the web app's /api proxy.
  const port = configService.get<number>('port') ?? 5000;

  setupApp(app);

  await app.listen(port);
}

void bootstrap();
