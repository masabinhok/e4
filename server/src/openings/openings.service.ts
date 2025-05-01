import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Opening, OpeningDocument  } from './schemas/opening.schema';
import { Model } from 'mongoose';
import { CreateOpeningDto } from './dto/create-opening.dto';
import { CreateVariationDto } from './dto/create-variation-dto';
import { Variation } from './schemas/variation.schema';

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

  async findOne(code: string) : Promise<Opening | null> {
    return this.openingModel.findOne({ code }).populate('variations').exec();
  }

  async contributeOpening(code: string, createVariationDto: CreateVariationDto): Promise<Variation> {
    console.log('Contributing to opening:', code, createVariationDto);
    const opening = await this.openingModel.findOne({code}).exec();

   
    if(!opening){
      throw new Error('Opening not found');
    }

     console.log(opening);


    const index = opening.variations?.length;
    const variation = {
      ...createVariationDto, 
      index: index,
    }
    opening.variations?.push(variation as Variation);
    await opening.save();
    return variation as Variation;
  }
  
}
