import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignUpDto } from './dtos/sign-up.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dtos/login.dto';
import { MongooseId } from 'src/types/types';
import { User } from 'src/users/schema/user.schema';
import { ConfigService } from '@nestjs/config';
import { Role } from 'src/roles/roles.enum';
import { createHash, randomUUID, timingSafeEqual } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  //generateHash
  async generateHash(val: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(val, salt);
    return hash;
  }

  //getTokens
  async getTokens(
    userId: MongooseId,
    role: Role,
    email: string,
    demo = false,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const payload = {
      sub: userId,
      email,
      role,
      ...(demo && { demo }),
      // Unique per token, so a rotated-out token never equals its replacement.
      jti: randomUUID(),
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
      accessToken,
      refreshToken,
    };
  }

  // sha256, not bcrypt: bcrypt only reads the first 72 bytes, and every JWT
  // shares a longer prefix than that, so any old token used to match.
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async storeRefreshToken(userId: MongooseId, rt: string) {
    return this.usersService.updateRtHash(userId, this.hashToken(rt));
  }

  async signUp(signUpDto: SignUpDto): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
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

    const tokens = await this.getTokens(
      newUser._id,
      newUser.role,
      newUser.email,
    );
    await this.storeRefreshToken(newUser._id, tokens.refreshToken);

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
    // Same error for both cases, so login can't be used to probe which emails exist.
    const isPassValid =
      existingUser && (await bcrypt.compare(password, existingUser.passHash));
    if (!existingUser || !isPassValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.getTokens(
      existingUser._id,
      existingUser.role,
      existingUser.email,
    );
    await this.storeRefreshToken(existingUser._id, tokens.refreshToken);

    return tokens;
  }

  async refresh(
    userId: MongooseId,
    rt: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    // A deleted user (e.g. an expired demo account) gets a 401, not a 404.
    const user = await this.usersService.findUserById(userId).catch(() => null);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const given = Buffer.from(this.hashToken(rt));
    const stored = Buffer.from(user.refreshToken);
    const matches =
      given.length === stored.length && timingSafeEqual(given, stored);

    if (!matches) {
      throw new UnauthorizedException('Invalid token');
    }

    const tokens = await this.getTokens(
      user._id,
      user.role,
      user.email,
      user.isDemo,
    );
    await this.storeRefreshToken(user._id, tokens.refreshToken);
    return tokens;
  }

  // One throwaway account per visitor, so demo visitors never share data.
  async demo(): Promise<{ accessToken: string; refreshToken: string }> {
    const unusablePassword = await this.generateHash(randomUUID());
    const user = await this.usersService.createDemoUser(unusablePassword);
    const tokens = await this.getTokens(user._id, user.role, user.email, true);
    await this.storeRefreshToken(user._id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: MongooseId): Promise<{
    message: string;
  }> {
    const user = await this.usersService.updateRtHash(userId, null);
    if (!user) {
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
