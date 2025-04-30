import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { OpeningsService } from './openings.service';
import { CreateOpeningDto } from './dto/create-opening.dto';
import { Opening } from './schemas/opening.schema';
import { CreateVariationDto } from './dto/create-variation-dto';
import { Variation } from './schemas/variation.schema';

@Controller('openings')
export class OpeningsController {
  constructor(private readonly openingsService: OpeningsService) {}

  @Get()
  findAll(): Promise<Opening[]> {
    return this.openingsService.findAll();
  }

  @Get(':code')
  findOne(@Param ('code') code:string): Promise<Opening |null>{
    return this.openingsService.findOne(code);
  }

  @Post('contribute/:code')
  contribute(@Param('code') code: string, @Body() createVariationDto: CreateVariationDto): Promise<Variation>{
    return this.openingsService.contributeOpening(code, createVariationDto);
  }

  @Post()
  create(@Body() createOpeningDto: CreateOpeningDto): Promise<Opening> {
    return this.openingsService.createOpening(createOpeningDto);
  }
}
