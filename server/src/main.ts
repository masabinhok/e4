import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //enable global validation, this will validate all incoming requests based on the DTOs defined in the application.
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
  origin: ['https://e4-learnchess.vercel.app', 'http://localhost:3000'], 
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
