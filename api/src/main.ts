import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { setupApp } from './app.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') ?? 5000;

  app.enableCors({
    origin: configService.get<string>('cors.origin'),
    credentials: true,
  });
  setupApp(app);

  await app.listen(port);
}

void bootstrap();
