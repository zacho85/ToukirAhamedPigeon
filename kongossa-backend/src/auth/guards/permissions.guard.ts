import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

/**
 * Shape of `request.user` after JwtAuthGuard. `userId` is what JwtStrategy
 * actually sets; `id`/`sub` are tolerated because older call sites assume them.
 */
interface AuthenticatedUser {
  userId?: number;
  id?: number;
  sub?: number;
  email?: string;
  role?: string;
}

/**
 * PermissionsGuard
 * ----------------
 * Authorizes against the dynamic Role/Permission tables — the same
 * `action:resource` strings the frontend gates on and that `auth.service.ts`
 * ships in the login payload.
 *
 * This is the server-side mirror of `<ProtectedRoute allOf={[...]}>`: the user
 * must hold EVERY permission listed by @RequirePermissions().
 *
 * Assumes an authentication guard has already populated `request.user`; it is
 * never a substitute for JwtAuthGuard.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Handler metadata wins over class metadata, so a controller can set a
    // default and one route can override it.
    const required = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required || required.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const userId = user.userId ?? user.id ?? user.sub;

    // An undefined id would make the Prisma filter below match every row, which
    // would grant every permission to every authenticated user. Fail closed.
    if (userId === undefined || userId === null) {
      throw new ForbiddenException('Could not resolve the authenticated user');
    }

    const granted = await this.getUserPermissions(Number(userId));
    const missing = required.filter((p) => !granted.has(p));

    if (missing.length > 0) {
      throw new ForbiddenException(
        `Missing required permission(s): ${missing.join(', ')}`,
      );
    }

    return true;
  }

  /** Flatten this user's role permissions to `action:resource` strings. */
  private async getUserPermissions(userId: number): Promise<Set<string>> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      select: {
        role: {
          select: {
            rolePermissions: {
              select: {
                permission: { select: { action: true, resource: true } },
              },
            },
          },
        },
      },
    });

    const permissions = new Set<string>();
    for (const userRole of userRoles) {
      for (const rp of userRole.role.rolePermissions) {
        permissions.add(`${rp.permission.action}:${rp.permission.resource}`);
      }
    }
    return permissions;
  }
}
