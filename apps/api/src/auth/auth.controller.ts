import { Body, Controller, Get, Post } from '@nestjs/common';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import { Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {

  constructor(
    private readonly authService: AuthService,
  ) {}

  @Get()
  hello() {
    return {
      message: 'Aura Atlas API 🚀',
    };
  }

  @Post('register')
  register(
    @Body() registerDto: RegisterDto,
  ) {
    return this.authService.register(registerDto);
  }

  @Post('login')
login(
  @Body() loginDto: LoginDto,
) {
  return this.authService.login(loginDto);
}

@UseGuards(JwtAuthGuard)
@Get('me')
me(@Req() req: any) {
  return req.user;
}

}