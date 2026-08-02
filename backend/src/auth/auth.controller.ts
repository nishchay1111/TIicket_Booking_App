import { Controller, Post, Body, Res, Req, UseGuards, UnauthorizedException, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserGuard } from '../user.guard';
import { Roles } from '../RBAC/roles.decorator';
import { Role } from '../RBAC/role.enum';
import { Throttle } from '@nestjs/throttler'; 

import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import type { Request, Response } from 'express';
import { Public } from '../RBAC/public.decorator';

/**
 * Controller responsible for handling authentication infrastructure requests,
 * including user registration, login sessions, token cycling, and identity retrieval.
 */
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  /**
   * Registers a new user account within the system.
   * Rate Limiting: Maximum 3 requests per minute.
   * Access: Public.
   */
  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } }) 
  @Post('createuser')
  async createUser(@Body() createUserDto: CreateUserDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.createUser(createUserDto, res);
  }

  /**
   * Authenticates user credentials to establish a valid session.
   * Rate Limiting: Maximum 5 requests per minute.
   * Access: Public.
   */
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) 
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(loginDto, res);
  }

  /**
   * Cycles expiring access tokens using a valid background refresh token cookie.
   * Access: Authenticated via HTTP-only cookie validation.
   */
  @Post('refresh-token')
  async refresh(@Req() req: Request) {
    const token = req.cookies?.refreshToken;
    if (!token) throw new UnauthorizedException('No refresh token');
    return this.authService.refresh(token);
  }

  /**
   * Destroys active authentication sessions and clears token states.
   * Access: Public.
   */
  @Public()
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.logout(req, res);
  }

  /**
   * Retrieves profile details for the currently logged-in identity context.
   * Access: Restricted to accounts matching USER or ORGANIZER roles.
   */
  @UseGuards(UserGuard)
  @Roles(Role.USER, Role.ORGANIZER)
  @Post('getuser')
  async getUser(@Req() req: any) {
    return this.authService.getUser(req.user.id);
  }
}