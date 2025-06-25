import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { Variation, VariationDocument } from './schema/variation.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { OpeningsService } from 'src/openings/openings.service';
import { ContributeVariationDto } from './dtos/contribute-variation.dto';
import { UsersService } from 'src/users/users.service';
import { MongooseId } from 'src/types/types';
import { Status } from 'src/openings/schemas/opening.schema';

@Injectable()
export class VariationsService {
  constructor(
    @InjectModel(Variation.name)
    private variationModel: Model<VariationDocument>,
    private openingsService: OpeningsService,
    private usersService: UsersService,
  ) {}

  async findAll(){
    const variations = await this.variationModel.find();
    return variations;
  }

  async acceptVariation(variationId: MongooseId){
    const variation = await this.variationModel.findByIdAndUpdate(variationId, {
      $set: {
        status: Status.Accepted
      }, 
    }, {
      new: true,
    }).populate('contributor')
    if(!variation){
      throw new BadRequestException('No such variation exists.');
    }

    await this.openingsService.addContribution(
          variation.code,
          variationId
        );
    await this.usersService.addContributedLines(
          variation.contributor?._id as MongooseId,
          variationId
        );

        return {
          message: 'Variation Accepted.'
        }
  }

  async contributeVariation(
    userId: MongooseId,
    code: string,
    dto: ContributeVariationDto,
  ) {
    const newVariation = await this.variationModel.create({
      code,
      ...dto,
      contributor: userId
    });
    if (!newVariation) {
      throw new InternalServerErrorException(
        'Failed to create a new variation',
      );
    }


    //this should be done after accepted by the admin.
    
  }

  async recordVariation(userId: MongooseId, dto: ContributeVariationDto) {
    const variation = { ...dto, code: 'recorded-pgns' };

    const newVariation = await this.variationModel.create(variation);
    if (!newVariation) {
      throw new InternalServerErrorException(
        'Failed to create a new variation',
      );
    }


    await this.usersService.addRecordedLines(
      userId,
      newVariation._id as MongooseId,
    );

    return {
      message: 'Successfully recorded a variation!',
    };
  }

  async addCustomVariation(userId: MongooseId, dto: ContributeVariationDto) {
    const variation = { ...dto, code: 'custom-pgns' };

    const newVariation = await this.variationModel.create(variation);
    if (!newVariation) {
      throw new InternalServerErrorException(
        'Failed to create a new variation',
      );
    }

    await this.usersService.addCustomPgns(
      userId,
      newVariation._id as MongooseId,
    );

    return {
      message: 'Successfully saved a custom pgn!',
    };
  }
}
