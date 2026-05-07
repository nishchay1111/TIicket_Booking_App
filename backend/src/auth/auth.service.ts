import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JsonStoreService } from '../common/json-store.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private readonly JWT_SECRET = 'ThisEndsRightHere^71364andNow';
  private readonly REFRESH_SECRET = 'AnotherSuperSecretStringForRefreshOnly';

  constructor(private readonly jsonStore: JsonStoreService) {}

  // Helper: Generate Tokens & Set Cookie
  generateAndSendTokens(res: Response, userId: string) {
    const authtoken = jwt.sign({ user: { id: userId } }, this.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: userId }, this.REFRESH_SECRET, { expiresIn: '7d' });

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
      date_created: new Date().toISOString(),
    };

    users.push(newUser);
    this.jsonStore.saveData('users', users);

    const authtoken = this.generateAndSendTokens(res, newUser.user_id);
    return { success: true, authtoken };
  }

  async login(loginDto: LoginDto, res: Response) {
    const { email, password } = loginDto;
    const users = this.jsonStore.loadData('users');
    const user = users.find((u) => u.user_email === email);

    if (!user || !(await bcrypt.compare(password, user.user_password))) {
      throw new BadRequestException('Invalid credentials');
    }

    const authtoken = this.generateAndSendTokens(res, user.user_id);
    return { success: true, authtoken };
  }

  refresh(refreshToken: string) {
    try {
      const decoded: any = jwt.verify(refreshToken, this.REFRESH_SECRET);
      const authtoken = jwt.sign({ user: { id: decoded.id } }, this.JWT_SECRET, { expiresIn: '15m' });
      return { success: true, authtoken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getUser(userId: string) {
    const users = this.jsonStore.loadData('users');
    const user = users.find((u) => u.user_id === userId);
    if (!user) throw new BadRequestException('User not found');

    const { user_password, ...userWithoutPassword } = user;
    return { success: true, user: userWithoutPassword };
  }
}