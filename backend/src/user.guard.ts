import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './RBAC/public.decorator';

/**
 * Authentication guard extending the Passport JWT strategy to protect incoming endpoints.
 * Intercepts request contexts to verify token signatures unless the target route 
 * is explicitly configured with public accessibility metadata.
 */
@Injectable()
export class UserGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Determines if the current execution context is permitted to proceed.
   * Checks for the presence of public route metadata decorators to short-circuit
   * passport authentication sequences where open access is intended.
   * 
   * @param context - The execution context of the active framework request lifecycle.
   * @returns A boolean or asynchronous confirmation indicating authorization validity.
   */
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    return super.canActivate(context);
  }
}