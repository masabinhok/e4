import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import { UserId } from 'src/types/types';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findUserById(userId: UserId): Promise<User | null> {
    const user = await this.userModel.findById(userId);
    return user ? user : null;
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

  async updateRtHash(userId: UserId, rtHash: string): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(userId, {
      refreshToken: rtHash,
    });

    if (!user) {
      throw new BadRequestException('User not found!');
    }
    return user;
  }
}
