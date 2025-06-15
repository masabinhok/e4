import { Controller, Get, Param } from '@nestjs/common';
import { OpeningsService } from './openings.service';

@Controller('openings')
export class OpeningsController {
  constructor(private readonly openingsService: OpeningsService) {}

  @Get('')
  async findAll() {
    return this.openingsService.findAll();
  }

  @Get(':code')
  async getOpening(@Param('code') code: string) {
    return this.openingsService.getOpening(code);
  }
}
