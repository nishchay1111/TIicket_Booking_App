import { Controller, Post, Body, Res, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UserGuard } from '../user.guard';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('createuser')
  async createUser(@Body() createUserDto: CreateUserDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.createUser(createUserDto, res);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(loginDto, res);
  }

  @Post('refresh-token')
  async refresh(@Req() req: Request) {
    const token = req.cookies.refreshToken;
    if (!token) throw new UnauthorizedException('No refresh token');
    return this.authService.refresh(token);
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refreshToken');
    return { success: true, message: 'Logged out successfully' };
  }

  // ✅ Route is now protected. req.user is populated by UserGuard.
  @UseGuards(UserGuard)
  @Post('getuser')
  async getUser(@Req() req: any) {
    return this.authService.getUser(req.user.id);
  }
}