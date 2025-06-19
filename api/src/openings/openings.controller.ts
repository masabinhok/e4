import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { OpeningsService } from './openings.service';
import { AddOpeningDto } from './dtos/add-opening.dto';

@Controller('openings')
export class OpeningsController {
  constructor(private readonly openingsService: OpeningsService) {}

  @Get('')
  async findAll() {
    return this.openingsService.findAll();
  }

  @Post('add')
  async addOpening(@Body() addOpeningDto: AddOpeningDto) {
    return this.openingsService.addOpening(addOpeningDto);
  }

  @Get(':code')
  async getOpening(@Param('code') code: string) {
    return this.openingsService.getOpening(code);
  }
}
