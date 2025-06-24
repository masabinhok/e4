import {
  BadRequestException,
  ForbiddenException,
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
import { v4 as uuidv4 } from 'uuid';
import { MongooseId } from 'src/types/types';
import { User } from 'src/users/schema/user.schema';
import { ConfigService } from '@nestjs/config';
import { Role } from 'src/roles/roles.enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService
  ) {}

  //generateHash
  async generateHash(val: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(val, salt);
    return hash;
  }


  //getTokens
  async getTokens(userId: MongooseId, role: Role, email: string ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const payload = {
      sub: userId, 
      email,
      role
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('jwt.accessSecret'),
        expiresIn: this.config.get<string>('jwt.accessExpire'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('jwt.refreshSecret'),
        expiresIn: this.config.get<string>('jwt.refreshExpire'),
      }),
    ]);
    return {
      accessToken, refreshToken
    }
  }

  async storeRefreshToken(userId: MongooseId, rt: string) {
    const hashedRt = await this.generateHash(rt);
    return this.usersService.updateRtHash(userId, hashedRt);
  }

  async signUp(signUpDto: SignUpDto): Promise<{
    accessToken: string, 
    refreshToken: string
  }>{
    const { fullName, email, password } = signUpDto;
    const existingUser = await this.usersService.findUserByEmail(email);

    if (existingUser) {
      throw new BadRequestException('Email already in use.');
    }

    const hashedPassword = await this.generateHash(password);
    const newUser = await this.usersService.createUser(
      fullName,
      email,
      hashedPassword,
    );

    if (!newUser) {
      throw new InternalServerErrorException('Failed to create user.');
    }

    const tokens = await this.getTokens(newUser._id as MongooseId, newUser.role, newUser.email);
    await this.storeRefreshToken(
      newUser._id as MongooseId,
      tokens.refreshToken,
    );
    console.log('returning tokens')
    return tokens;
  }

  async login(loginDto: LoginDto): Promise<{
      accessToken: string;
      refreshToken: string;
  }> {
    //get credentials from the client
    const { email, password } = loginDto;

    //check if the user exists
    const existingUser = await this.usersService.findUserByEmail(email);
    if (!existingUser) {
      throw new BadRequestException(`Invalid email`);
    }

    const isPassValid = await bcrypt.compare(password, existingUser.passHash);

    if (!isPassValid) {
      throw new BadRequestException('Invalid Password');
    }

    const tokens = await this.getTokens(existingUser._id as MongooseId, existingUser.role, existingUser.email);
    await this.storeRefreshToken(
      existingUser._id as MongooseId,
      tokens.refreshToken,
    );

    return tokens;
  }

  async refresh(userId: MongooseId, rt: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    
    const user = await this.usersService.findUserById(userId);
    console.log(user);
    if(!user || !user.refreshToken){
      throw new ForbiddenException('Invalid refresh token');
    }

    const matches = await bcrypt.compare(rt , user.refreshToken);

    if(!matches){
      throw new UnauthorizedException('Invalid token');
    }


    const tokens = await this.getTokens(user._id as MongooseId, user.role, user.email );
    await this.storeRefreshToken(user._id as MongooseId, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: MongooseId): Promise<{
    message: string;
  }> {
    const user = await this.usersService.updateRtHash(userId, null);
    if(!user){
      throw new BadRequestException('No user to logout!');
    }

    return {
      message: 'Successfully logged out user.',
    };
  }

  async getMe(userId: MongooseId): Promise<Partial<User> | null> {
    const user = await this.usersService.findUserById(userId);
    if (!user) return null;
    return this.usersService.getSafeUser(user);
  }
}
