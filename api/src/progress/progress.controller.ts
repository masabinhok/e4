import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { MongooseId } from 'src/types/types';
import { RecordProgressDto } from './dtos/record-progress.dto';
import { ProgressService } from './progress.service';

@UseGuards(AuthGuard)
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  async list(@GetUser('sub') userId: MongooseId) {
    return this.progressService.list(userId);
  }

  @Post(':variationId')
  async record(
    @GetUser('sub') userId: MongooseId,
    @Param('variationId', ParseObjectIdPipe) variationId: MongooseId,
    @Body() dto: RecordProgressDto,
  ) {
    return this.progressService.record(userId, variationId, dto.mistakes);
  }
}
