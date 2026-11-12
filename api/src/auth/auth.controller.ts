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
import { Throttle } from '@nestjs/throttler';
import { ClientThrottlerGuard } from 'src/common/guards/client-throttler.guard';

const HOUR = 60 * 60 * 1000;

// The web app reaches the API through its own /api proxy, so cookies are
// first-party: SameSite=Lax blocks cross-site use, and Secure is on wherever
// there's HTTPS (production) and off on http://localhost.
function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  } as const;
}

function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
) {
  const options = cookieOptions();
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

  @UseGuards(ClientThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: HOUR } })
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

  @UseGuards(ClientThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60 * 1000 } })
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

  @UseGuards(ClientThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: HOUR } })
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
    res.clearCookie('accessToken', cookieOptions());

    res.clearCookie('refreshToken', cookieOptions());

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
