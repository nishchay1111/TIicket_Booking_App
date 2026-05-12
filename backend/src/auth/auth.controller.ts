import { Controller, Post, Body, Res, Req, UseGuards, UnauthorizedException, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserGuard } from '../user.guard';
import { Roles } from '../RBAC/roles.decorator';
import { Role } from '../RBAC/role.enum';
import { Throttle } from '@nestjs/throttler'; // 👈 Import Throttle

import type { CreateUserDto } from './dto/create-user.dto';
import type { LoginDto } from './dto/login.dto';
import type { Request, Response } from 'express';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 👈 3 signups per minute per IP/User
  @Post('createuser')
  async createUser(@Body() createUserDto: CreateUserDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.createUser(createUserDto, res);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 👈 5 login attempts per minute
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(loginDto, res);
  }

  @Post('refresh-token')
  async refresh(@Req() req: Request) {
    const token = req.cookies?.refreshToken;
    if (!token) throw new UnauthorizedException('No refresh token');
    return this.authService.refresh(token);
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refreshToken');
    return { success: true, message: 'Logged out successfully' };
  }

  @UseGuards(UserGuard)
  @Roles(Role.USER, Role.ADMIN)
  @Post('getuser')
  async getUser(@Req() req: any) {
    return this.authService.getUser(req.user.id);
  }
}