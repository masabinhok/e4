import { Module } from '@nestjs/common';
import { OpeningsService } from './openings.service';
import { OpeningsController } from './openings.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Opening, OpeningSchema } from './schemas/opening.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: Opening.name, schema: OpeningSchema
    }]) 
  ],
  controllers: [OpeningsController],
  providers: [OpeningsService],
})
export class OpeningsModule {}
