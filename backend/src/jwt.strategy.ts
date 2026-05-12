import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JsonStoreService } from './common/json-store.service';
import { Role } from './RBAC/role.enum'; // 👈 Import the Role Enum

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly jsonStore: JsonStoreService) {
    super({
      // 1. Tell Passport where to find the token
      jwtFromRequest: ExtractJwt.fromHeader('auth-token'),
      ignoreExpiration: false,
      secretOrKey: 'ThisEndsRightHere^71364andNow', // Use .env in production
    });
  }

  /**
   * This runs AFTER the token is cryptographically verified.
   * @param payload The decoded JWT object.
   */
  async validate(payload: any) {
    // Extract ID from the standard payload structure you defined in AuthService
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
      const { user_password, ...rest } = userRecord;
      return { 
        ...rest, 
        id: userRecord.user_id, 
        role: userRecord.role || Role.USER // Fallback to USER if not set
      };
    } else {
      const { organizer_password, ...rest } = orgRecord;
      return { 
        ...rest, 
        id: orgRecord.organizer_id, 
        verified: orgRecord.admin_verification, 
        role: orgRecord.role || Role.ORGANIZER // Fallback to ORGANIZER if not set
      };
    }
  }
}