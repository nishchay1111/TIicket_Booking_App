import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Retrieve the required roles from the @Roles() decorator
    // It checks the method first, then the controller class (for overrides)
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 2. If no roles are specified on the route, allow access by default
    if (!requiredRoles) {
      return true;
    }

    // 3. Extract the user object from the request
    // This assumes UserGuard (Passport) has already run and populated req.user
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User not found in request');
    }

    // 4. Check if the user has the required permission
    // We assume the user object has a 'role' property
    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Insufficient permissions. Required roles: [${requiredRoles}]`,
      );
    }

    return true;
  }
}