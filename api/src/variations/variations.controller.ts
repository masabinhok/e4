import {  Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { VariationsService } from './variations.service';
import { ContributeVariationDto } from './dtos/contribute-variation.dto';
import { GetUserId } from 'src/common/decorators/get-user.decorator';
import { MongooseId } from 'src/types/types';
import { AuthGuard } from 'src/guards/auth.guard';


@UseGuards(AuthGuard)
@Controller('variations')
export class VariationsController {
  constructor(private readonly variationsService: VariationsService) {    
  }
  
      @Post('record')
      async recordVariation(@GetUserId() userId: MongooseId, @Body() dto: ContributeVariationDto ){
        console.log('hi')
        return this.variationsService.recordVariation(userId, dto);
      } 

      @Post('contribute/:code')
      async contributeVariation(@GetUserId() userId: MongooseId,@Param('code') code: string, @Body() dto: ContributeVariationDto ){
        console.log('hi contirbtue')
        return this.variationsService.contributeVariation(userId, code, dto);
      } 
}
