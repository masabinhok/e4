import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Opening, OpeningDocument } from './schemas/opening.schema';
import { Model } from 'mongoose';

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
}
