import { SetMetadata } from '@nestjs/common';
import { Role } from './role.enum'; // Relative import within the same folder

export const ROLES_KEY = 'roles';

/**
 * Custom decorator to restrict access to specific roles.
 * Usage: @Roles(Role.ADMIN)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);