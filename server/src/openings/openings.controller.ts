import { Body, Controller, Get, Post } from '@nestjs/common';
import { OpeningsService } from './openings.service';
import { CreateOpeningDto } from './dto/create-opening.dto';
import { Opening } from './schemas/opening.schema';

@Controller('openings')
export class OpeningsController {
  constructor(private readonly openingsService: OpeningsService) {}

  @Get()
  findAll(): Promise<Opening[]> {
    return this.openingsService.findAll();
  }

  @Post()
  create(@Body() createOpeningDto: CreateOpeningDto): Promise<Opening> {
    return this.openingsService.createOpening(createOpeningDto);
  }
}
