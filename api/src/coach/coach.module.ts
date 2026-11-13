import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Opening, OpeningSchema } from 'src/openings/schemas/opening.schema';
import {
  Variation,
  VariationSchema,
} from 'src/variations/schema/variation.schema';
import { CoachController } from './coach.controller';
import { CoachReply, CoachReplySchema } from './coach.schema';
import { CoachService } from './coach.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CoachReply.name, schema: CoachReplySchema },
      { name: Variation.name, schema: VariationSchema },
      { name: Opening.name, schema: OpeningSchema },
    ]),
  ],
  controllers: [CoachController],
  providers: [CoachService],
})
export class CoachModule {}
