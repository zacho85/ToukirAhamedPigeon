import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

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
 * RolesGuard (canonical)
 * ----------------------
 * Authorizes a request against the roles listed by @Roles(...) on the handler
 * or the controller class.
 *
 * A user passes if EITHER source of truth grants the role:
 *   1. the `role` claim carried in the JWT (the User.role string column), or
 *   2. a matching row in the UserRole join table.
 *
 * Both are accepted deliberately. The two role systems in this codebase are not
 * kept in sync, and requiring the DB rows alone would lock existing admins out
 * of the admin panel. Requiring the JWT claim alone would ignore roles granted
 * through the Role/Permission CRUD UI.
 *
 * Assumes an authentication guard has already populated `request.user`; it is
 * never a substitute for JwtAuthGuard.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Read handler AND class metadata. Reading only the handler means a
    // controller-level @Roles() is ignored and the guard allows everything.
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // JwtStrategy.validate() returns { userId, email, role }. Older call sites
    // assume `id`/`sub`, so accept all three rather than silently resolving to
    // undefined — an undefined userId makes the Prisma filter below match every
    // row, which would grant the role to every authenticated user.
    const userId = user.userId ?? user.id ?? user.sub;

    if (userId === undefined || userId === null) {
      throw new ForbiddenException('Could not resolve the authenticated user');
    }

    // 1. Role claim carried in the token.
    if (user.role && requiredRoles.includes(user.role)) {
      return true;
    }

    // 2. Roles assigned through the Role/UserRole tables.
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId: Number(userId) },
      include: { role: true },
    });

    const userRoleNames = userRoles.map((ur) => ur.role.name);

    if (requiredRoles.some((role) => userRoleNames.includes(role))) {
      return true;
    }

    throw new ForbiddenException('Insufficient permissions');
  }
}
