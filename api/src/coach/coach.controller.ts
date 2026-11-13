import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ClientThrottlerGuard } from 'src/common/guards/client-throttler.guard';
import { AskCoachDto } from './dtos/ask-coach.dto';
import { CoachService } from './coach.service';

@Controller('coach')
export class CoachController {
  constructor(private readonly coachService: CoachService) {}

  @UseGuards(AuthGuard, ClientThrottlerGuard)
  @Throttle({ default: { limit: 30, ttl: 60 * 60 * 1000 } })
  @Post()
  @HttpCode(200)
  async ask(@Body() dto: AskCoachDto) {
    return this.coachService.ask(dto.variationId, dto.index, dto.played);
  }
}
