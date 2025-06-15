import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findOneById(userId: string): Promise<UserDocument | null> {
    const user = await this.userModel.findById(userId);
    return user ? user : null;
  }
  async findOneByUsername(username: string): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({
      username,
    });
    return user ? user : null;
  }

  async createUser(username: string, hash: string): Promise<UserDocument> {
    const user = await this.userModel.create({
      username,
      passHash: hash,
    });

    if (!user) {
      throw new BadRequestException('Failed to create a new user.');
    }

    return user;
  }

  async updateRtHash(userId: string, rtHash: string): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(userId, {
      refreshToken: rtHash,
    });

    if (!user) {
      throw new BadRequestException('User not found!');
    }
    return user;
  }

  async removeRefreshToken(userId: string): Promise<{
    message: string;
    user: UserDocument | null;
  }> {
    const loggedOutUser = await this.userModel.findByIdAndUpdate(userId, {
      refreshToken: null,
    });
    return {
      message: 'Refresh Token set to NULL',
      user: loggedOutUser,
    };
  }
}
