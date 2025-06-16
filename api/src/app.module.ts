import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { OpeningsModule } from './openings/openings.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { VariationsModule } from './variations/variations.module';
import config from './config/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [config],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config) => ({
        secret: config.get('jwt.secret')
      }),
      global: true,
      inject: [ConfigService]
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config) => ({
        uri: config.get('database.connectionString'),
      }),
      inject: [ConfigService],
    }),
    OpeningsModule,
    UsersModule,
    AuthModule,
    VariationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
