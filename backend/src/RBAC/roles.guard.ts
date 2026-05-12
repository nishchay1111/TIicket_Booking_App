import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role } from './role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Check for @Roles() metadata on the handler or class
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 2. If no roles are defined, the route is public (or just requires AuthN)
    if (!requiredRoles) {
      return true;
    }

    // 3. Get the user from the request (populated by Passport's UserGuard)
    const { user } = context.switchToHttp().getRequest();

    // 4. Validate user role
    const hasRole = requiredRoles.some((role) => user?.role === role);

    if (!hasRole) {
      throw new ForbiddenException('Access Denied: You do not have the required permissions');
    }

    return true;
  }
}