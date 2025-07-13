import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import { MongooseId } from 'src/types/types';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findUsers() {
    const users = await this.userModel.find();
    return await Promise.all(users.map((user) => this.getSafeUser(user)));
  }

  async findUserById(userId: MongooseId): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new InternalServerErrorException('User not found');
    }
    return user;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({
      email,
    });
    return user ? user : null;
  }

  async createUser(
    fullName: string,
    email: string,
    passHash: string,
  ): Promise<User> {
    const user = await this.userModel.create({
      fullName,
      email,
      passHash,
    });

    if (!user) {
      throw new BadRequestException('Failed to create a new user.');
    }

    return user;
  }

  async updateRtHash(userId: MongooseId, rtHash: string | null): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(userId, {
      refreshToken: rtHash,
    });

    if (!user) {
      throw new BadRequestException('User not found!');
    }
    return user;
  }

  getSafeUser(user: User): Partial<User> {
    const plainUser = user.toObject();
    const { passHash, refreshToken, ...safeUser } = plainUser;
    // passHash and refreshToken are intentionally extracted and not used
    void passHash;
    void refreshToken;
    return safeUser as Partial<User>;
  }

  async deleteOne(userId: MongooseId) {
    const deletedUser = await this.userModel.findByIdAndDelete(userId);
    if (!deletedUser) {
      throw new BadRequestException('No user with such id exists');
    }
    return {
      message: 'Successfully Deleted!',
    };
  }

  async addRecordedLines(
    userId: MongooseId,
    variationId: MongooseId,
  ): Promise<User> {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      {
        $push: { recordedLines: variationId },
      },
      {
        new: true, // return the updated document
      },
    );
    if (!updatedUser) {
      throw new InternalServerErrorException('Failed to update the user');
    }
    return updatedUser;
  }
  async addCustomPgns(
    userId: MongooseId,
    variationId: MongooseId,
  ): Promise<User> {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      {
        $push: { customLines: variationId },
      },
      {
        new: true, // return the updated document
      },
    );
    if (!updatedUser) {
      throw new InternalServerErrorException('Failed to update the user');
    }
    return updatedUser;
  }
  async addContributedLines(
    userId: MongooseId,
    variationId: MongooseId,
  ): Promise<User> {
    const updatedUser = await this.userModel.findByIdAndUpdate(userId, {
      $push: {
        contributedLines: variationId,
      },
    });

    if (!updatedUser) {
      throw new InternalServerErrorException('Failed to update the user');
    }
    return updatedUser;
  }

  async getRecordedPgns(userId: MongooseId) {
    const user = await this.userModel
      .findById(userId)
      .populate('recordedLines');
    const recordings = user?.recordedLines;
    const recordedLines = {
      name: 'Recorded Lines',
      code: 'recorded-lines',
      description: 'This is a set of recorded lines by you.',
      variations: recordings,
    };
    return recordedLines;
  }
  async getCustomPgns(userId: MongooseId) {
    const user = await this.userModel.findById(userId).populate('customLines');

    const customs = user?.customLines;
    const customLines = {
      name: 'Custom Pgns',
      code: 'custom-pgns',
      description: 'This is a set of custom pgns saved by you.',
      variations: customs,
    };
    return customLines;
  }
}
