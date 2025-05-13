import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { OpeningsModule } from './openings/openings.module';
import { UsersModule } from './users/users.module';


@Module({
  imports: [MongooseModule.forRoot('mongodb+srv://sabinshresthaer:qhXPs15V87erspQs@cluster0.0d5ezgo.mongodb.net/chess'), OpeningsModule, UsersModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
