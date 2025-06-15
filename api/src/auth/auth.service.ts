import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { SignUpDto } from './dtos/sign-up.dto';
import { UserDocument } from 'src/users/schema/user.schema';
import { UsersService } from 'src/users/users.service';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dtos/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async generateHash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }

  async getTokens(
    userId: string,
    username: string,
  ): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    const payload = {
      sub: userId,
      username,
    };
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.ACCESS_TOKEN_SECRET,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.REFRESH_TOKEN_SECRET,
        expiresIn: '7d',
      }),
    ]);
    return { access_token, refresh_token };
  }

  async updateRtHash(userId: string, rt: string): Promise<UserDocument | null> {
    const hash = await this.generateHash(rt);
    return this.usersService.updateRtHash(userId, hash);
  }

  async signUp(signUpDto: SignUpDto): Promise<{
    message: string;
    user: UserDocument;
  }> {
    //get user info from client
    const { username, password } = signUpDto;

    //check for existing user
    const existingUser = await this.usersService.findUserByUsername(username);
    //if exists, throw exception
    if (existingUser) {
      throw new BadRequestException(
        'User already exists! Either Login or choose a different username!',
      );
    }
    //if not hash the password
    const hashedPassword = await this.generateHash(password);

    //create a new user
    const newUser = await this.usersService.createUser(
      username,
      hashedPassword,
    );
    if (!newUser) {
      throw new InternalServerErrorException('Failed to create user.');
    }

    //cleanup sensitive info before sending to the client
    const { passHash: _, ...userWithoutPassword } = newUser.toObject()
      ? newUser.toObject()
      : newUser;
    //return a new user with a success message
    return {
      message: 'User created successfully!',
      user: userWithoutPassword,
    };
  }

  async login(loginDto: LoginDto): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    //get credentials from the client
    const { username, password } = loginDto;

    //check if the user exists
    const existingUser = await this.usersService.findUserByUsername(username);
    if (!existingUser) {
      throw new BadRequestException(`Invalid Username`);
    }

    const isPassValid = await bcrypt.compare(password, existingUser.passHash);

    if (!isPassValid) {
      throw new BadRequestException('Invalid Password');
    }

    // user exists and pass is valid too, we have to login the user...
    const tokens = await this.getTokens(
      existingUser._id as string,
      existingUser.username,
    );
    await this.updateRtHash(existingUser._id as string, tokens.refresh_token);
    return tokens;
  }

  async refresh(userId: string, rt: string) {
    const user = await this.usersService.findUserById(userId);

    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    const rtMatches = await bcrypt.compare(rt, user.refreshToken);
    if (!rtMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user._id as string, user.username);
    await this.updateRtHash(user._id as string, tokens.refresh_token);
    return tokens;
  }

  async logout(userId: string): Promise<{
    message: string;
  }> {
    await this.usersService.removeRefreshToken(userId);
    return {
      message: 'Successfully logged out user.',
    };
  }
}
