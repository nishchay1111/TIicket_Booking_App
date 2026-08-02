import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { IS_PUBLIC_KEY } from './public.decorator';
import { Role } from './role.enum';

/**
 * Role-Based Access Control (RBAC) guard that evaluates the metadata assigned to route handlers
 * and classes against the authenticated user's assigned role tier.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Evaluates the current execution context to determine if the request satisfies role-based security policies.
   * Short-circuits authorization evaluation if the route is explicitly flagged as public.
   * 
   * @param context - The current execution context of the inbound request lifecycle.
   * @returns A boolean indicating whether the request is authorized to proceed.
   * @throws ForbiddenException - If the authenticated user profile lacks the required permissions.
   */
  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    const hasRole = requiredRoles.some((role) => user?.role === role);

    if (!hasRole) {
      throw new ForbiddenException('Access Denied: You do not have the required permissions');
    }

    return true;
  }
}