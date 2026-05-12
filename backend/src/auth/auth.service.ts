import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JsonStoreService } from '../common/json-store.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '../RBAC/role.enum';
import { UserEntity } from './entities/user.entity'; // 👈 Import Entity
import { plainToInstance } from 'class-transformer'; // 👈 Import Transformer utility

import type { CreateUserDto } from './dto/create-user.dto';
import type { LoginDto } from './dto/login.dto';
import type { Response } from 'express';

@Injectable()
export class AuthService {
  private readonly REFRESH_SECRET = 'AnotherSuperSecretStringForRefreshOnly';

  constructor(
    private readonly jsonStore: JsonStoreService,
    private readonly jwtService: JwtService,
  ) {}

  generateAndSendTokens(res: Response, userId: string, role: string) {
    const payload = { user: { id: userId, role: role } };
    const authtoken = this.jwtService.sign(payload);
    
    const refreshToken = this.jwtService.sign({ id: userId, role: role }, {
      secret: this.REFRESH_SECRET,
      expiresIn: '7d'
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
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
    
    // 👈 Wrap the response in the Entity
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
    
    // 👈 Wrap the response in the Entity
    return { 
      success: true, 
      authtoken, 
      user: plainToInstance(UserEntity, user) 
    };
  }

  refresh(refreshToken: string) {
    try {
      const decoded: any = this.jwtService.verify(refreshToken, { secret: this.REFRESH_SECRET });
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

    // 👈 No more manual 'delete' or destructuring!
    // The Interceptor in main.ts + UserEntity @Exclude does the work.
    return { success: true, user: plainToInstance(UserEntity, user) };
  }
}