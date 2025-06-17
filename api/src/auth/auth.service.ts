import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignUpDto } from './dtos/sign-up.dto';
import { UsersService } from 'src/users/users.service';
import { Types } from 'mongoose';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dtos/login.dto';
import { InjectModel } from '@nestjs/mongoose';
import { RefreshToken } from './schemas/refresh-token.schema';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { UserId } from 'src/types/types';
import { User } from 'src/users/schema/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshToken>,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async generateHash(val: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(val, salt);
    return hash;
  }

  async getTokens(userId: UserId): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    const access_token = this.jwtService.sign({ userId }, { expiresIn: '1h' });
    const refresh_token = uuidv4();
    return {
      access_token,
      refresh_token,
    };
  }

  async storeRefreshToken(userId: UserId, rt: string) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    await this.refreshTokenModel.create({
      userId,
      token: rt,
      expiryDate,
    });
  }

  async signUp(signUpDto: SignUpDto): Promise<{user: any, tokens: {
    access_token: string, 
    refresh_token: string
  }

  }> {
    const { username, password } = signUpDto;
    const existingUser = await this.usersService.findUserByUsername(username);

    if (existingUser) {
      throw new BadRequestException('Username already in use.');
    }

    const hashedPassword = await this.generateHash(password);
    const newUser = await this.usersService.createUser(
      username,
      hashedPassword,
    );

    if (!newUser) {
      throw new InternalServerErrorException('Failed to create user.');
    }

    const tokens = await this.getTokens(newUser._id as UserId);
    await this.storeRefreshToken(
      newUser._id as UserId,
      tokens.refresh_token,
    );

    return {
      user: newUser, tokens
    };
  }

  async login(loginDto: LoginDto): Promise<{
    user: any,
    tokens: {
      access_token: string;
      refresh_token: string;
    }
  }> {
    //get credentials from the client
    const { username, password } = loginDto;

    //check if the user exists
    const existingUser = await this.usersService.findUserByUsername(username);
    if (!existingUser) {
      throw new UnauthorizedException(`Invalid Username`);
    }

    const isPassValid = await bcrypt.compare(password, existingUser.passHash);

    if (!isPassValid) {
      throw new UnauthorizedException('Invalid Password');
    }

    const tokens = await this.getTokens(existingUser._id as UserId);
    await this.storeRefreshToken(
      existingUser._id as UserId,
      tokens.refresh_token,
    );

  
    return {
      user: existingUser, tokens
    }
  }

  async refreshTokens(rt: string): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    const token = await this.refreshTokenModel.findOne({
      token: rt,
      expiryDate: { $gte: new Date(Date.now()) },
    });

    if (!token) {
      throw new UnauthorizedException('Invalid Refresh Token');
    }

    const tokens = await this.getTokens(token.userId);
    await this.storeRefreshToken(token.userId, tokens.refresh_token);
    await this.refreshTokenModel.findOneAndDelete({
      _id: token._id,
    });
    return tokens;
  }

  async logout(userId: UserId): Promise<{
    message: string;
  }> {
    const deletedToken = await this.refreshTokenModel.findOneAndDelete({
      userId: new Types.ObjectId(userId),
    });

    return {
      message: 'Successfully logged out user.',
    };
  }

  async getMe(userId: UserId): Promise<User | null>{
    return this.usersService.findUserById(userId);
  }
}
