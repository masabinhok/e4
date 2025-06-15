import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { OpeningsModule } from './openings/openings.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { VariationsModule } from './variations/variations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      'mongodb+srv://sabinshresthaer:qhXPs15V87erspQs@cluster0.0d5ezgo.mongodb.net/chess',
    ),
    OpeningsModule,
    UsersModule,
    AuthModule,
    VariationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
