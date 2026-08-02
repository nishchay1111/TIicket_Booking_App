import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JsonStoreService } from '../common/json-store.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenBlacklistService } from '../common/token-blacklist.service';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '../RBAC/role.enum';
import { UserEntity } from './entities/user.entity';
import { plainToInstance } from 'class-transformer';

import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import type { Response, Request } from 'express';

/**
 * Service handling business logic for authentication infrastructure,
 * including user registration, session management, token issuance, and revocation.
 */
@Injectable()
export class AuthService {

  constructor(
    private readonly jsonStore: JsonStoreService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tokenBlacklist: TokenBlacklistService,
  ) { }

  /**
   * Generates access tokens and sets a secure refresh token cookie on the client response.
   * @param res - The Express response object used to attach cookies.
   * @param userId - The unique identifier of the target user.
   * @param role - The authorized system role assigned to the user.
   * @returns A signed short-lived JSON Web Token for authorization headers.
   */
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

  /**
   * Registers a new user inside the persistence layer, hashing their credential payload.
   * @param createUserDto - The structural details required for generating a user account.
   * @param res - The Express response object used to drop session state cookies.
   * @returns The outcome state along with the new authorized entity instance.
   */
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

  /**
   * Validates matching credentials against persisted users to initialize a session.
   * @param loginDto - The input payload consisting of primary identifier fields.
   * @param res - The Express response object used to drop session state cookies.
   * @returns The authorization response containing the access token.
   */
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
   * Explicitly terminates active session contexts, revoking tokens within the blacklist engine.
   * @param req - The incoming Express request object containing headers and cookies.
   * @param res - The outgoing Express response context to wipe browser records.
   * @returns Status affirmation signaling a cleared session.
   */
  async logout(req: Request, res: Response) {
    const authToken = req.headers['auth-token'] as string;
    const refreshToken = req.cookies?.['refreshToken'];

    if (authToken) {
      await this.tokenBlacklist.revokeToken(authToken);
    }

    if (refreshToken) {
      await this.tokenBlacklist.revokeToken(refreshToken);
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
    });

    return { success: true, message: 'User logged out and tokens revoked successfully.' };
  }

  /**
   * Reissues fresh short-lived verification tokens after auditing token validity.
   * @param refreshToken - The unverified refresh token string supplied by the host client.
   * @returns A renewed access token wrapping payload context.
   */
  refresh(refreshToken: string) {
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

  /**
   * Looks up a registered entity across user and organizer storage planes.
   * @param userId - The identity identifier key being searched.
   * @returns A stripped UserEntity profile instance safe for transmission.
   */
  async getUser(userId: string) {
    const users = this.jsonStore.loadData('users');
    const organizers = this.jsonStore.loadData('organizers');
    const user = users.find((u) => u.user_id === userId);
    const organizer = organizers.find((o) => o.organizer_id === userId);
    
    if (user) return {
      success: true,
      user: plainToInstance(UserEntity, user, { excludeExtraneousValues: true })
    };

    if (organizer) return {
      success: true,
      user: plainToInstance(UserEntity, organizer, { excludeExtraneousValues: true })
    };
  }
}