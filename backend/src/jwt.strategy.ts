import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JsonStoreService } from './common/json-store.service';

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

  // 2. This runs AFTER the token is verified. 
  // 'payload' is the decoded JWT object.
  async validate(payload: any) {
    const userId = payload.user.id;

    // Load your JSON data
    const users = this.jsonStore.loadData('users');
    const organizers = this.jsonStore.loadData('organizers');

    const userRecord = users.find((u) => u.user_id?.toString() === userId.toString());
    const orgRecord = organizers.find((o) => o.organizer_id?.toString() === userId.toString());

    if (!userRecord && !orgRecord) {
      throw new UnauthorizedException('User no longer exists in records');
    }

    // 3. Whatever is returned here is attached to req.user automatically
    if (userRecord) {
      const { user_password, ...rest } = userRecord;
      return { ...rest, id: userRecord.user_id, role: 'user' };
    } else {
      const { organizer_password, ...rest } = orgRecord;
      return { 
        ...rest, 
        id: orgRecord.organizer_id, 
        verified: orgRecord.admin_verification, 
        role: 'organizer' 
      };
    }
  }
}