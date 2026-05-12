import { SetMetadata } from '@nestjs/common';

/**
 * The key used to store and retrieve role metadata.
 * Consistent naming is required for the Reflector to find it in the Guard.
 */
export const ROLES_KEY = 'roles';

/**
 * Custom decorator to specify which roles are allowed to access a route.
 * Usage: @Roles('admin', 'organizer')
 * 
 * @param roles - A list of strings representing the allowed roles.
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);