import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// 'jwt' matches the default name of the PassportStrategy we used
export class UserGuard extends AuthGuard('jwt') {}