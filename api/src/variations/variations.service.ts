import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Variation, VariationDocument } from './schema/variation.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Chess } from 'chess.js';
import { OpeningsService } from 'src/openings/openings.service';
import { ContributeVariationDto } from './dtos/contribute-variation.dto';
import { UsersService } from 'src/users/users.service';
import { MongooseId } from 'src/types/types';
import { Status } from 'src/openings/schemas/opening.schema';

// Replays the line from the starting position; the client is never trusted to send legal moves.
export function assertLegalLine(moves: string[]) {
  const chess = new Chess();
  moves.forEach((move, i) => {
    try {
      chess.move(move);
    } catch {
      throw new BadRequestException(
        `Illegal move ${i + 1}: "${move}" is not legal in this position`,
      );
    }
  });
}

@Injectable()
export class VariationsService {
  constructor(
    @InjectModel(Variation.name)
    private variationModel: Model<VariationDocument>,
    private openingsService: OpeningsService,
    private usersService: UsersService,
  ) {}

  async findAll() {
    return this.variationModel.find();
  }

  async deleteOne(variationId: MongooseId) {
    const deleted = await this.variationModel.findByIdAndDelete(variationId);
    if (!deleted) {
      throw new NotFoundException('No variation with such id exists');
    }
    await this.openingsService.pullVariation(variationId);
    return { message: 'Successfully Deleted!' };
  }

  async deleteByCode(code: string) {
    await this.variationModel.deleteMany({ code });
  }

  // A deleted user's private lines and pending submissions go with them;
  // accepted contributions stay, because they are now part of a public opening.
  async deleteOwnedBy(userId: MongooseId) {
    await this.variationModel.deleteMany({
      contributor: userId,
      status: Status.Pending,
    });
    await this.variationModel.deleteMany({
      contributor: userId,
      code: { $in: ['recorded-pgns', 'custom-pgns'] },
    });
  }

  async acceptVariation(variationId: MongooseId) {
    const pending = await this.variationModel.findOne({
      _id: variationId,
      status: Status.Pending,
    });
    if (!pending) {
      throw new NotFoundException('No pending variation with that id');
    }
    // Check the target first, so a variation is never marked accepted without a home.
    await this.openingsService.getOpening(pending.code);

    // Conditional update: a second, concurrent approval matches nothing and stops here.
    const accepted = await this.variationModel.findOneAndUpdate(
      { _id: variationId, status: Status.Pending },
      { $set: { status: Status.Accepted } },
      { new: true },
    );
    if (!accepted) {
      throw new NotFoundException('No pending variation with that id');
    }

    await this.openingsService.addContribution(accepted.code, variationId);
    if (accepted.contributor) {
      await this.usersService.addContributedLines(
        accepted.contributor as unknown as MongooseId,
        variationId,
      );
    }
    return { message: 'Variation Accepted!' };
  }

  async contributeVariation(
    userId: MongooseId,
    code: string,
    dto: ContributeVariationDto,
  ) {
    assertLegalLine(dto.moves);
    await this.openingsService.getOpening(code);
    await this.variationModel.create({ ...dto, code, contributor: userId });
    return { message: 'Variation submitted for review!' };
  }

  async recordVariation(userId: MongooseId, dto: ContributeVariationDto) {
    assertLegalLine(dto.moves);
    const variation = await this.variationModel.create({
      ...dto,
      code: 'recorded-pgns',
      status: Status.Accepted,
      contributor: userId,
    });
    await this.usersService.addRecordedLines(
      userId,
      variation._id as MongooseId,
    );
    return { message: 'Successfully recorded a variation!' };
  }

  async addCustomVariation(userId: MongooseId, dto: ContributeVariationDto) {
    assertLegalLine(dto.moves);
    const variation = await this.variationModel.create({
      ...dto,
      code: 'custom-pgns',
      status: Status.Accepted,
      contributor: userId,
    });
    await this.usersService.addCustomPgns(userId, variation._id as MongooseId);
    return { message: 'Successfully saved a custom pgn!' };
  }
}
