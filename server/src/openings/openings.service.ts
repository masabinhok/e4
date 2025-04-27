import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Opening, OpeningDocument  } from './schemas/opening.schema';
import { Model } from 'mongoose';
import { CreateOpeningDto } from './dto/create-opening.dto';

@Injectable()
export class OpeningsService {
  constructor(@InjectModel(Opening.name) private openingModel: Model<OpeningDocument>){}

  async createOpening(createOpeningDto: CreateOpeningDto): Promise<Opening> {
    const createdOpening = new this.openingModel(createOpeningDto);
    return createdOpening.save();
  }

  async findAll(): Promise<Opening[]>{
    return this.openingModel.find().populate('variations').exec();
  }
}
