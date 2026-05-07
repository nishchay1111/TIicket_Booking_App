import {CanActivate,ExecutionContext,Injectable,UnauthorizedException,} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JsonStoreService } from './common/json-store.service';
import { Request } from 'express';

@Injectable()
export class UserGuard implements CanActivate {
  // Move this to a .env file later for better security
  private readonly JWT_SECRET = 'ThisEndsRightHere^71364andNow';

  constructor(private readonly jsonStore: JsonStoreService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user: any }>();
    
    // 1. Check for the 'auth-token' header
    const token = request.headers['auth-token'] as string;

    if (!token) {
      throw new UnauthorizedException('Please authenticate using a valid token');
    }

    try {
      // 2. Verify the JWT
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      const userId = decoded.user.id;

      // 3. Load data from your JSON stores
      const users = this.jsonStore.loadData('users');
      const organizers = this.jsonStore.loadData('organizers');

      // 4. Find the account (User or Organizer)
      const userRecord = users.find((u) => u.user_id === userId);
      const orgRecord = organizers.find((o) => o.organizer_id === userId);

      if (!userRecord && !orgRecord) {
        throw new UnauthorizedException('User no longer exists in records');
      }

      // 5. Attach clean data to the request object
      if (userRecord) {
        const { user_password, ...rest } = userRecord;
        request.user = { ...rest, id: userRecord.user_id, role: 'user' };
      } else {
        const { organizer_password, ...rest } = orgRecord;
        request.user = { 
          ...rest, 
          id: orgRecord.organizer_id, 
          verified: orgRecord.admin_verification, 
          role: 'organizer' 
        };
      }

      return true; 
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}