import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
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
      throw new NotFoundException(`No opening with code "${code}"`);
    }
    return opening;
  }

  // Returns the deleted opening so the caller can remove its variations.
  async deleteOne(openingId: MongooseId) {
    const deletedOpening = await this.openingModel.findByIdAndDelete(openingId);
    if (!deletedOpening) {
      throw new NotFoundException('No opening with such id exists');
    }
    return deletedOpening;
  }

  async pullVariation(variationId: MongooseId) {
    await this.openingModel.updateMany(
      { variations: variationId },
      { $pull: { variations: variationId } },
    );
  }

  async deletePendingBy(userId: MongooseId) {
    await this.openingModel.deleteMany({
      contributor: userId,
      status: Status.Pending,
    });
  }

  async findAll() {
    const openings = await this.openingModel.find();
    return openings;
  }

  async findAccepted() {
    const openings = await this.openingModel.find({
      status: Status.Accepted,
    });
    return openings;
  }

  async findPending(userId: MongooseId) {
    const openings = await this.openingModel.find({
      status: Status.Pending,
      contributor: userId,
    });
    return openings;
  }

  async acceptOpening(openingId: MongooseId) {
    const accepted = await this.openingModel.findOneAndUpdate(
      { _id: openingId, status: Status.Pending },
      { $set: { status: Status.Accepted } },
    );
    if (!accepted) {
      throw new NotFoundException('No pending opening with that id');
    }

    return {
      message: 'Opening Accepted!',
    };
  }

  async cancelContribution(openingId: MongooseId, userId: MongooseId) {
    const deleted = await this.openingModel.findOneAndDelete({
      _id: openingId,
      contributor: userId,
      status: Status.Pending,
    });
    if (!deleted) {
      throw new NotFoundException(
        'No pending contribution of yours with that id',
      );
    }
    return {
      message: 'Cancelled Contribution!',
    };
  }

  async addOpening(dto: AddOpeningDto, userId: MongooseId) {
    const newOpening = await this.openingModel.create({
      ...dto,
      contributor: userId,
    });
    if (!newOpening) {
      throw new InternalServerErrorException('Failed to create a new opening');
    }
    return {
      message: 'Successfully Added!',
    };
  }

  async addContribution(code: string, variationId: MongooseId) {
    // $addToSet: approving the same variation twice can't list it twice.
    const updated = await this.openingModel.findOneAndUpdate(
      { code },
      { $addToSet: { variations: variationId } },
    );
    if (!updated) {
      throw new NotFoundException(`No opening with code "${code}"`);
    }
  }
}
