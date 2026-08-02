import { SetMetadata } from '@nestjs/common';
import { Role } from './role.enum';

/**
 * The metadata key lookup identifier assigned to mapped route roles.
 */
export const ROLES_KEY = 'roles';

/**
 * Custom decorator used to attach authorization role arrays to route handlers,
 * which are subsequently evaluated by guard interceptors to enforce RBAC policies.
 * 
 * @param roles - A variadic collection of allowed Role enum values.
 * @returns A NestJS custom decorator instance configuring the target metadata block.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);