import { Controller, Post, Body, Res, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserGuard } from '../user.guard';

// Use 'import type' for everything used as a type in the constructor or methods
import type { CreateUserDto } from './dto/create-user.dto';
import type { LoginDto } from './dto/login.dto';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('createuser')
  async createUser(
    @Body() createUserDto: CreateUserDto, 
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.createUser(createUserDto, res);
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto, 
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.login(loginDto, res);
  }

  @Post('refresh-token')
  async refresh(@Req() req: Request) {
    // Optional chaining ensures this doesn't crash if cookies aren't parsed yet
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
  @Post('getuser')
  async getUser(@Req() req: any) {
    // req.user is populated by your JwtStrategy.validate() method
    return this.authService.getUser(req.user.id);
  }
}