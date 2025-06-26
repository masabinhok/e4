import { forwardRef, Module } from '@nestjs/common';
import { VariationsService } from './variations.service';
import { VariationsController } from './variations.controller';
import { OpeningsModule } from 'src/openings/openings.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Variation, VariationSchema } from './schema/variation.schema';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Variation.name,
        schema: VariationSchema,
      },
    ]),
    UsersModule,
    forwardRef(() => OpeningsModule),
  ],
  exports: [VariationsService],
  controllers: [VariationsController],
  providers: [VariationsService],
})
export class VariationsModule {}
