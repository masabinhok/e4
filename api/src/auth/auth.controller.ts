import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dtos/sign-up.dto';
import { LoginDto } from './dtos/login.dto';
import { Request, Response } from 'express';
import { RefreshTokenGuard } from 'src/common/guards/refresh-token.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { MongooseId } from 'src/types/types';

function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
) {
  const options = { httpOnly: true, secure: true, sameSite: 'none' } as const;
  res.cookie('accessToken', accessToken, {
    ...options,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie('refreshToken', refreshToken, {
    ...options,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signUp(
    @Body() signUpDto: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.signUp(signUpDto);

    setAuthCookies(res, accessToken, refreshToken);

    return {
      message: 'Signed Up Successfully',
    };
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.login(loginDto);

    setAuthCookies(res, accessToken, refreshToken);

    return {
      message: 'Logged In Successfully',
    };
  }

  @Post('demo')
  async demo(@Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.demo();
    setAuthCookies(res, accessToken, refreshToken);
    return { message: 'Demo session started' };
  }

  @UseGuards(RefreshTokenGuard)
  @Post('logout')
  async logout(
    @GetUser('sub') userId: MongooseId,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(userId);
    res.clearCookie('accessToken', {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    return {
      message: 'Logged Out Successfully',
    };
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refresh(
    @GetUser('sub') userId: MongooseId,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rt = req.cookies['refreshToken'] as string;
    const { accessToken, refreshToken } = await this.authService.refresh(
      userId,
      rt,
    );
    setAuthCookies(res, accessToken, refreshToken);

    return {
      message: 'Token Refreshed Successfully',
    };
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async getUserProfile(@GetUser('sub') userId: MongooseId) {
    return this.authService.getMe(userId);
  }
}
