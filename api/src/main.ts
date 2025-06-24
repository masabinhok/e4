import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') ?? 5000; 

  app.enableCors({
    origin: configService.get<string>('cors.origin'),
    credentials: true
  },);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(port);
}
bootstrap();
