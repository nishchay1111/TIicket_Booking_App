import { Controller, Post, Body, Res, Req, UseGuards, UnauthorizedException, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserGuard } from '../user.guard';
import { Roles } from '../RBAC/roles.decorator';
import { Role } from '../RBAC/role.enum';
import { Throttle } from '@nestjs/throttler'; 

import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import type { Request, Response } from 'express';
import {Public} from '../RBAC/public.decorator'

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } }) 
  @Post('createuser')
  async createUser(@Body() createUserDto: CreateUserDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.createUser(createUserDto, res);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) 
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
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) { // 👈 1. Added @Req() parameter
    return this.authService.logout(req, res); // 👈 2. Delegated extraction and file tracking to AuthService
  }

  @UseGuards(UserGuard)
  @Roles(Role.USER)
  @Post('getuser')
  async getUser(@Req() req: any) {
    return this.authService.getUser(req.user.id);
  }
}