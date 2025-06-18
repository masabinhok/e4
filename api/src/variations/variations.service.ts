import { Injectable, InternalServerErrorException, UseGuards } from '@nestjs/common';
import { Variation, VariationDocument } from './schema/variation.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { OpeningsService } from 'src/openings/openings.service';
import { ContributeVariationDto } from './dtos/contribute-variation.dto';
import { UsersService } from 'src/users/users.service';
import { MongooseId } from 'src/types/types';


@Injectable()
export class VariationsService {
  constructor(
    @InjectModel(Variation.name)
    private variationModel: Model<VariationDocument>,
    private openingsService: OpeningsService,
    private usersService: UsersService,
  ) {}

  async contributeVariation(userId: MongooseId, code: string, dto: ContributeVariationDto){
    const newVariation = await this.variationModel.create({
      code,
      ...dto
    });
    if(!newVariation){
      throw new InternalServerErrorException('Failed to create a new variation')
    }
    console.log(newVariation);
    await this.openingsService.addContribution(code, newVariation._id as MongooseId);
    await this.usersService.addContributedLines(userId, newVariation._id as MongooseId);
  }

  async recordVariation(userId: MongooseId, dto: ContributeVariationDto){
    const variation = {...dto, code: 'recorded-pgns'}
    console.log(variation)
    const newVariation = await this.variationModel.create(
     variation
    );
    if(!newVariation){
      throw new InternalServerErrorException('Failed to create a new variation')
    }
    console.log(newVariation);

    await this.usersService.addRecordedLines(userId, newVariation._id as MongooseId);
 
    return {
      message: 'Successfully recorded a variation!'
    }
  }



}
