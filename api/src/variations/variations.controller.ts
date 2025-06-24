import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { VariationsService } from './variations.service';
import { ContributeVariationDto } from './dtos/contribute-variation.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { MongooseId } from 'src/types/types';
import { AuthGuard } from 'src/common/guards/auth.guard';


@UseGuards(AuthGuard)
@Controller('variations')
export class VariationsController {
  constructor(private readonly variationsService: VariationsService) {}

  @Post('record')
  async recordVariation(
    @GetUser('sub') userId: MongooseId,
    @Body() dto: ContributeVariationDto,
  ) {
    return this.variationsService.recordVariation(userId, dto);
  }

  @Post('custom')
  async customVariation(
    @GetUser('sub') userId: MongooseId,
    @Body() dto: ContributeVariationDto,
  ) {
    return this.variationsService.addCustomVariation(userId, dto);
  }

  @Post('contribute/:code')
  async contributeVariation(
    @GetUser('sub') userId: MongooseId,
    @Param('code') code: string,
    @Body() dto: ContributeVariationDto,
  ) {
    return this.variationsService.contributeVariation(userId, code, dto);
  }
}
