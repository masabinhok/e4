import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { OpeningsModule } from './openings/openings.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { VariationsModule } from './variations/variations.module';
import config, { validateEnv } from './config/config';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [config],
      validate: validateEnv,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get('database.databaseUrl'),
      }),
      inject: [ConfigService],
    }),
    OpeningsModule,
    UsersModule,
    AuthModule,
    VariationsModule,
    AdminModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
