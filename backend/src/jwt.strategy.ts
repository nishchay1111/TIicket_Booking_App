import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config'; 
import { JsonStoreService } from './common/json-store.service';
import { TokenBlacklistService } from './common/token-blacklist.service'; // 👈 1. Import TokenBlacklistService
import { Role } from './RBAC/role.enum'; 
import type { Request } from 'express'; // 👈 2. Import Express Request type

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly jsonStore: JsonStoreService,
    private readonly configService: ConfigService, 
    private readonly tokenBlacklist: TokenBlacklistService, // 👈 3. Inject TokenBlacklistService here
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromHeader('auth-token'),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET') || '', 
      passReqToCallback: true, // 👈 4. CRITICAL: Tells Passport to forward the request to validate()
    });
  }

  /**
   * This runs AFTER the token is cryptographically verified.
   * @param req The raw incoming request object.
   * @param payload The decoded JWT object.
   */
  async validate(req: Request, payload: any) { // 👈 5. Updated method signature to accept 'req'
    const token = req.headers['auth-token'] as string;

    // 🛑 6. Check the stateful JSON blacklist before processing the user session
    if (token && this.tokenBlacklist.isTokenRevoked(token)) {
      throw new UnauthorizedException('This token has been revoked / logged out.');
    }

    // Extract ID from the standard payload structure defined in AuthService
    const userId = payload.user?.id || payload.id;

    if (!userId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Load your JSON data for verification
    const users = this.jsonStore.loadData('users');
    const organizers = this.jsonStore.loadData('organizers');

    const userRecord = users.find((u) => u.user_id?.toString() === userId.toString());
    const orgRecord = organizers.find((o) => o.organizer_id?.toString() === userId.toString());

    // If the record doesn't exist in our JSON files, the token is invalid
    if (!userRecord && !orgRecord) {
      throw new UnauthorizedException('User or Organizer no longer exists');
    }

    /**
     * Whatever is returned here is attached to req.user automatically.
     * We ensure the 'role' property matches our Enum for the RolesGuard to work.
     */
    if (userRecord) {
      const {user_id,role, user_password, ...rest } = userRecord;
      return { 
        ...rest, 
        id: user_id, 
        role: role || Role.USER // Fallback to USER if not set
      };
    } else {
      const { role,organizer_id,admin_verification,organizer_password, ...rest } = orgRecord;
      return { 
        ...rest, 
        id: organizer_id, 
        verified: admin_verification, 
        role: role || Role.ORGANIZER // Fallback to ORGANIZER if not set
      };
    }
  }
}