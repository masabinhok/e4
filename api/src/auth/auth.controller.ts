import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dtos/sign-up.dto';
import { LoginDto } from './dtos/login.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Request, Response } from 'express';
import { ObjectId } from 'mongoose';
import { UserId } from 'src/types/types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login(loginDto);

    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return { messsage: 'Login Successful' };
  }

  @Post('logout')
  async logout(@GetUser('id') userId: UserId, @Res({passthrough: true}) res: Response) {
    await this.authService.logout(userId);
    res.clearCookie('access_token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
    });
    return {
      message: 'Logged Out Successfully.'
    }
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refresh_token'];
    console.log(refreshToken);
    const tokens = await this.authService.refreshTokens(refreshToken);
    console.log(tokens)
    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return { messsage: 'Token Refreshed!' };
  }
}
