import type { AuthenticatedRequest } from '../security/access';
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { IsEmail, MaxLength } from 'class-validator';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { EmailCodeDto } from '../security/dto';
class ResendDto {
  @IsEmail() @MaxLength(254) email!: string;
}
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Get() hello() {
    return { message: 'Aura Atlas API' };
  }
  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }
  @Post('resend-verification')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  resend(@Body() dto: ResendDto) {
    return this.auth.resend(dto.email);
  }
  @Post('verify-email')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  verify(@Body() dto: EmailCodeDto) {
    return this.auth.verify(dto.token);
  }
  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.login(dto);
    res.cookie('atlas_session', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: result.expiresAt,
    });
    return { user: result.user };
  }
  @UseGuards(JwtAuthGuard) @Get('me') me(@Req() req: AuthenticatedRequest) {
    const { id, name, email, role, emailVerified, emailVerificationDeadline } =
      req.user;
    return { id, name, email, role, emailVerified, emailVerificationDeadline };
  }
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie('atlas_session', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
    return this.auth.logout(req.user.sessionId);
  }
}
