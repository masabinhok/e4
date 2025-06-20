import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Opening, OpeningDocument } from './schemas/opening.schema';
import { Model } from 'mongoose';
import { MongooseId } from 'src/types/types';
import { AddOpeningDto } from './dtos/add-opening.dto';

@Injectable()
export class OpeningsService {
  constructor(
    @InjectModel(Opening.name) private openingModel: Model<OpeningDocument>,
  ) {}

  async getOpening(code: string): Promise<OpeningDocument> {
    const opening = await this.openingModel
      .findOne({
        code,
      })
      .populate('variations');

    if (!opening) {
      throw new BadRequestException(`No Opening for code : ${code}`);
    }
    return opening;
  }

  async findAll() {
    const opening = await this.openingModel.find();
    return opening;
  }

  async addOpening(dto: AddOpeningDto) {
    const newOpening = await this.openingModel.create(dto);
    if (!newOpening) {
      throw new InternalServerErrorException('Failed to create a new opening');
    }
    return newOpening;
  }

  async addContribution(
    code: string,
    variationId: MongooseId,
  ): Promise<Opening> {
    const updatedOpening = await this.openingModel.findOneAndUpdate(
      {
        code,
      },
      {
        $push: {
          variations: variationId,
        },
      },
    );
    if (!updatedOpening) {
      throw new InternalServerErrorException('Failed to update the opening');
    }

    return updatedOpening;
  }
}
