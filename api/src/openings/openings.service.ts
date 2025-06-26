import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Opening, OpeningDocument, Status } from './schemas/opening.schema';
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

  async deleteOne(openingId: MongooseId){
    const deletedOpening = await this.openingModel.findByIdAndDelete(openingId);
    if(!deletedOpening){
      throw new BadRequestException('No opening with such id exist')
    }
    return {
      message: 'Deletion Successful'
    }
  }

  async findAll() {
    const openings = await this.openingModel.find();
    return openings;
  }

  async findAccepted() {
    const openings = await this.openingModel.find({
      status: Status.Accepted
    });
    return openings;
  }

  async findPending(userId: MongooseId) {
    const openings = await this.openingModel.find({
      status: Status.Pending,
      contributor: userId
    })
    return openings;
  }

  async acceptOpening(openingId: MongooseId){
      await this.openingModel.findByIdAndUpdate(openingId, {
        $set: {
          status: Status.Accepted
        }
      }, {
        new: true
      });

      return {
        message: 'Opening Accepted'
      }
  }

  async cancelContribution(openingId: MongooseId){
     await this.openingModel.findByIdAndDelete(openingId);
     return {
      message: 'Cancelled Opening Contribution'
     }
  }

  async addOpening(dto: AddOpeningDto, userId: MongooseId) {
    const newOpening = await this.openingModel.create({
      ...dto, 
      contributor: userId
    });
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
