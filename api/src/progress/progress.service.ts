import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongooseId } from 'src/types/types';
import { UsersService } from 'src/users/users.service';
import { Variation } from 'src/variations/schema/variation.schema';
import { Status } from 'src/openings/schemas/opening.schema';
import { Progress } from './progress.schema';
import { schedule } from './schedule';

@Injectable()
export class ProgressService {
  constructor(
    @InjectModel(Progress.name) private progressModel: Model<Progress>,
    @InjectModel(Variation.name) private variationModel: Model<Variation>,
    private usersService: UsersService,
  ) {}

  /** Records a finished drill and schedules the next review. */
  async record(userId: MongooseId, variationId: MongooseId, mistakes: number) {
    const exists = await this.variationModel.exists({
      _id: variationId,
      status: Status.Accepted,
    });
    if (!exists) throw new NotFoundException('No such line');

    const current = await this.progressModel.findOne({
      user: userId,
      variation: variationId,
    });
    const next = schedule(current?.box ?? 0, mistakes);
    const user = await this.usersService.findUserById(userId);

    return this.progressModel.findOneAndUpdate(
      { user: userId, variation: variationId },
      {
        $set: {
          ...next,
          lastMistakes: mistakes,
          ...(user.isDemo && { expiresAt: user.expiresAt }),
        },
        $inc: { reviews: 1 },
      },
      { upsert: true, new: true, projection: { user: 0, __v: 0 } },
    );
  }

  /** Everything this user has drilled, with enough of each line to list and open it. */
  async list(userId: MongooseId) {
    const items = await this.progressModel
      .find({ user: userId }, { user: 0, __v: 0 })
      .sort({ dueAt: 1 })
      .populate('variation', 'title code chapter moves');
    // Lines removed from a course leave progress behind; skip those.
    return items.filter((p) => p.variation);
  }

  async deleteForUser(userId: MongooseId) {
    await this.progressModel.deleteMany({ user: userId });
  }

  async deleteForVariations(variationIds: MongooseId[]) {
    await this.progressModel.deleteMany({ variation: { $in: variationIds } });
  }
}
