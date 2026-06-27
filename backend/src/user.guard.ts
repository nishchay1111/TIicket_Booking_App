import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './RBAC/public.decorator'; // 👈 Import

@Injectable()
export class UserGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) { // 👈 Inject Reflector
    super();
  }

  canActivate(context: ExecutionContext) {
    // 👈 If route is @Public(), skip JWT check entirely
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // Otherwise run normal JWT validation
    return super.canActivate(context);
  }
}