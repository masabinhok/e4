import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import { MongooseId } from 'src/types/types';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findUserById(userId: MongooseId): Promise<{
    user: User
  }> {
    const user = await this.userModel.findById(userId);
    if(!user){
      throw new InternalServerErrorException('User not found');
    }
    return {user};
  }
  async findUserByUsername(username: string): Promise<User | null> {
    const user = await this.userModel.findOne({
      username,
    });
    return user ? user : null;
  }

  async createUser(username: string, hash: string): Promise<User> {
    const user = await this.userModel.create({
      username,
      passHash: hash,
    });

    if (!user) {
      throw new BadRequestException('Failed to create a new user.');
    }

    return user;
  }

  async updateRtHash(userId: MongooseId, rtHash: string): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(userId, {
      refreshToken: rtHash,
    });

    if (!user) {
      throw new BadRequestException('User not found!');
    }
    return user;
  }

  async addRecordedLines(userId: MongooseId, variationId: MongooseId): Promise<User>{
    console.log(userId);
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      {
        $push: { recordedLines: variationId }
      },
      {
        new: true, // return the updated document
      }
    );
    if(!updatedUser){
      throw new InternalServerErrorException('Failed to update the user')
    }
    return updatedUser;
  }
  async addCustomPgns(userId: MongooseId, variationId: MongooseId): Promise<User>{
    console.log(userId);
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      {
        $push: { customLines: variationId }
      },
      {
        new: true, // return the updated document
      }
    );
    if(!updatedUser){
      throw new InternalServerErrorException('Failed to update the user')
    }
    return updatedUser;
  }
  async addContributedLines(userId: MongooseId, variationId: MongooseId): Promise<User>{
    const updatedUser = await this.userModel.findByIdAndUpdate(userId, {
      $push : {
        contributedLines: variationId
      }
    });

    if(!updatedUser){
      throw new InternalServerErrorException('Failed to update the user')
    }
    return updatedUser;
  }

  async getRecordedPgns(userId: MongooseId){
    const user = await this.userModel.findById(userId).populate('recordedLines');
    const recordings = user?.recordedLines;
    const recordedLines = {
      name: 'Recorded Lines',
      code: 'recorded-lines',
      description: 'This is a set of recorded lines by you.',
      variations: recordings
    };
    return recordedLines;
  }
  async getCustomPgns(userId: MongooseId){
    const user = await this.userModel.findById(userId).populate('customLines');
    console.log(user);
    const customs = user?.customLines;
    const customLines = {
      name: 'Custom Pgns',
      code: 'custom-pgns',
      description: 'This is a set of custom pgns saved by you.',
      variations: customs
    };
    return customLines;
  }
}
