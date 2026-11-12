import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from 'src/users/users.module';
import {
  Variation,
  VariationSchema,
} from 'src/variations/schema/variation.schema';
import { ProgressController } from './progress.controller';
import { Progress, ProgressSchema } from './progress.schema';
import { ProgressService } from './progress.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Progress.name, schema: ProgressSchema },
      { name: Variation.name, schema: VariationSchema },
    ]),
    UsersModule,
  ],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
