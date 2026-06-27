import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JsonStoreService } from '../common/json-store.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config'; 
import { TokenBlacklistService } from '../common/token-blacklist.service'; // 👈 1. Import the blacklist service
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '../RBAC/role.enum';
import { UserEntity } from './entities/user.entity'; 
import { plainToInstance } from 'class-transformer'; 

import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import type { Response, Request } from 'express'; // 👈 2. Import Express Request type

@Injectable()
export class AuthService {

  constructor(
    private readonly jsonStore: JsonStoreService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService, 
    private readonly tokenBlacklist: TokenBlacklistService, // 👈 3. Inject TokenBlacklistService
  ) {}

  generateAndSendTokens(res: Response, userId: string, role: string) {
    const payload = { user: { id: userId, role: role } };
    
    const authtoken = this.jwtService.sign(payload);
    
    const refreshToken = this.jwtService.sign({ id: userId, role: role }, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d'
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return authtoken;
  }

  async createUser(createUserDto: CreateUserDto, res: Response) {
    const users = this.jsonStore.loadData('users');
    const { name, email, password } = createUserDto;

    if (users.find((u) => u.user_email === email)) {
      throw new BadRequestException('A user with this E-Mail already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      user_id: uuidv4(),
      user_name: name,
      user_password: hashedPassword,
      user_email: email,
      role: Role.USER,
      date_created: new Date().toISOString(),
    };

    users.push(newUser);
    this.jsonStore.saveData('users', users);

    const authtoken = this.generateAndSendTokens(res, newUser.user_id, newUser.role);
    
    return { 
      success: true, 
      authtoken, 
      user: plainToInstance(UserEntity, newUser) 
    };
  }

  async login(loginDto: LoginDto, res: Response) {
    const { email, password } = loginDto;
    const users = this.jsonStore.loadData('users');
    const user = users.find((u) => u.user_email === email);

    if (!user || !(await bcrypt.compare(password, user.user_password))) {
      throw new BadRequestException('Invalid credentials');
    }

    const authtoken = this.generateAndSendTokens(res, user.user_id, user.role || Role.USER);
    
    return { 
      success: true, 
      authtoken, 
      user: plainToInstance(UserEntity, user) 
    };
  }

  /**
   * Stateful Logout for Users
   */
  async logout(req: Request, res: Response) { // 👈 4. Added stateful logout method
    const authToken = req.headers['auth-token'] as string;
    const refreshToken = req.cookies?.['refreshToken'];

    // Blacklist the incoming active auth header token
    if (authToken) {
      await this.tokenBlacklist.revokeToken(authToken);
    }

    // Blacklist the cookie refresh token if it exists
    if (refreshToken) {
      await this.tokenBlacklist.revokeToken(refreshToken);
    }

    // Clear cookie from the user's browser
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
    });

    return { success: true, message: 'User logged out and tokens revoked successfully.' };
  }

  refresh(refreshToken: string) {
    // 🛑 5. Block refresh operations instantly if the refresh token string is blacklisted
    if (this.tokenBlacklist.isTokenRevoked(refreshToken)) {
      throw new UnauthorizedException('This refresh token has been revoked.');
    }

    try {
      const decoded: any = this.jwtService.verify(refreshToken, { 
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') 
      });
      
      const authtoken = this.jwtService.sign({ 
        user: { id: decoded.id, role: decoded.role } 
      });
      return { success: true, authtoken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getUser(userId: string) {
    const users = this.jsonStore.loadData('users');
    const user = users.find((u) => u.user_id === userId);
    if (!user) throw new BadRequestException('User not found');

    return { success: true, user: plainToInstance(UserEntity, user) };
  }
}