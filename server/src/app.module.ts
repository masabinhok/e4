import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { OpeningsModule } from './openings/openings.module';


@Module({
  imports: [MongooseModule.forRoot('mongodb+srv://sabinshresthaer:qhXPs15V87erspQs@cluster0.0d5ezgo.mongodb.net/chess'), OpeningsModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
