import { forwardRef, Module } from '@nestjs/common';
import { OpeningsService } from './openings.service';
import { OpeningsController } from './openings.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Opening, OpeningSchema } from './schemas/opening.schema';
import { VariationsModule } from 'src/variations/variations.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Opening.name,
        schema: OpeningSchema,
      },
    ]),
    forwardRef(() => VariationsModule),
  ],
  controllers: [OpeningsController],
  providers: [OpeningsService],
  exports: [OpeningsService],
})
export class OpeningsModule {}
