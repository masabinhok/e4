import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UsersModule } from 'src/users/users.module';
import { OpeningsModule } from 'src/openings/openings.module';
import { VariationsModule } from 'src/variations/variations.module';
import { ProgressModule } from 'src/progress/progress.module';

@Module({
  imports: [UsersModule, OpeningsModule, VariationsModule, ProgressModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
