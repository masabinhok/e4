import { forwardRef, Module } from '@nestjs/common';
import { VariationsService } from './variations.service';
import { VariationsController } from './variations.controller';
import { OpeningsModule } from 'src/openings/openings.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Variation, VariationSchema } from './schema/variation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Variation.name,
        schema: VariationSchema,
      },
    ]),
    forwardRef(() => OpeningsModule),
  ],
  controllers: [VariationsController],
  providers: [VariationsService],
})
export class VariationsModule {}
