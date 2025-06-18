import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dtos/sign-up.dto';
import { LoginDto } from './dtos/login.dto';
import { Request, Response } from 'express';
import { AuthGuard } from 'src/guards/auth.guard';
import { GetUserId } from 'src/common/decorators/get-user.decorator';
import { UserId } from 'src/types/types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto,
@Res({passthrough: true}) res: Response) {
    const {user, tokens} = await this.authService.signUp(signUpDto);

    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 15*60*1000,
      path: '/'
    });

    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true, 
      secure: true, 
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    })

    return {
      user,
      message: 'Signup Successful!'
    }
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const {user, tokens} = await this.authService.login(loginDto);

    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return { 
      user, 
      messsage: 'Login Successful' };
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const userId = req['userId'];

    await this.authService.logout(userId);
    res.clearCookie('access_token', {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
    });
    return {
      message: 'Logged Out Successfully.',
    };
  }

  @UseGuards(AuthGuard)
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refresh_token'];

    const tokens = await this.authService.refreshTokens(refreshToken);

    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return { messsage: 'Token Refreshed!' };
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async getMe(@GetUserId() userId: UserId){
    return this.authService.getMe(userId);
  }
}
