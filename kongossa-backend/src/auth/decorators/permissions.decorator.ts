import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'required_permissions';

/**
 * Require dynamic permissions for a route, expressed as `action:resource`
 * strings — the same vocabulary the frontend gates on (`read:role`,
 * `create:budget`, …) and the same strings `auth.service.ts` puts in the login
 * payload.
 *
 * ALL listed permissions must be held, mirroring `<ProtectedRoute allOf={...}>`.
 *
 * Prefer this over @Roles(): permissions are data, so they survive a role being
 * renamed. The role called "admin" in one deployment is "superadmin" in another.
 *
 * Usage:
 *   @RequirePermissions('read:role')
 *   @Get()
 *   findAll() { ... }
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
