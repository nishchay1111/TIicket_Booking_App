import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config'; 
import { JsonStoreService } from './common/json-store.service';
import { TokenBlacklistService } from './common/token-blacklist.service';
import { Role } from './RBAC/role.enum'; 
import type { Request } from 'express';

/**
 * Passport strategy implementing JSON Web Token authentication.
 * Extracts tokens from custom headers, verifies signatures, checks revocation status,
 * and compiles the corresponding identity profile into the execution context.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly jsonStore: JsonStoreService,
    private readonly configService: ConfigService, 
    private readonly tokenBlacklist: TokenBlacklistService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromHeader('auth-token'),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET') || '', 
      passReqToCallback: true,
    });
  }

  /**
   * Post-verification hook that validates user records and enforces session validity checks.
   * Asserts token freshness against the stateful revocation blacklist registry.
   * 
   * @param req - The raw incoming Express request object containing header metadata.
   * @param payload - The successfully decoded token payload structure.
   * @returns An authenticated entity payload mapping fields to the request user reference.
   * @throws UnauthorizedException - If token extraction fails, identity records are missing, or token is blacklisted.
   */
  async validate(req: Request, payload: any) {
    const token = req.headers['auth-token'] as string;

    if (token && this.tokenBlacklist.isTokenRevoked(token)) {
      throw new UnauthorizedException('This token has been revoked / logged out.');
    }

    const userId = payload.user?.id || payload.id;

    if (!userId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const users = this.jsonStore.loadData('users');
    const organizers = this.jsonStore.loadData('organizers');

    const userRecord = users.find((u) => u.user_id?.toString() === userId.toString());
    const orgRecord = organizers.find((o) => o.organizer_id?.toString() === userId.toString());

    if (!userRecord && !orgRecord) {
      throw new UnauthorizedException('User or Organizer no longer exists');
    }

    if (userRecord) {
      const { user_id, role, user_password, ...rest } = userRecord;
      return { 
        ...rest, 
        id: user_id, 
        role: role || Role.USER
      };
    } else {
      const { role, organizer_id, admin_verification, organizer_password, ...rest } = orgRecord;
      return { 
        ...rest, 
        id: organizer_id, 
        verified: admin_verification, 
        role: role || Role.ORGANIZER
      };
    }
  }
}