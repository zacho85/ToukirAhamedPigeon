import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Shape of `request.user` after JwtAuthGuard. `userId` is what JwtStrategy
 * actually sets; `id`/`sub` are tolerated because older call sites assume them.
 */
interface AuthenticatedUser {
  userId?: number;
  id?: number;
  sub?: number;
}

/**
 * AgentGuard
 * ----------
 * Restricts a route to the authenticated user's OWN active, KYC-verified agent
 * profile, and attaches it as `request.agent`.
 *
 * This is identity-based, not permission-based: an agent is not an administrator.
 * Admin-facing agent management uses PermissionsGuard instead.
 */
@Injectable()
export class AgentGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser; agent?: unknown }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // JwtStrategy.validate() returns { userId, email, role }.
    //
    // This previously read `user.id`, which is always undefined — and Prisma
    // DROPS an undefined filter rather than matching nothing, so the query
    // returned the first active, verified agent in the table and attached a
    // STRANGER'S agent profile to the request. Resolve explicitly and fail
    // closed instead.
    const userId = user.userId ?? user.id ?? user.sub;

    if (userId === undefined || userId === null) {
      throw new ForbiddenException('Could not resolve the authenticated user');
    }

    const agent = await this.prisma.agentProfile.findFirst({
      where: {
        userId: Number(userId),
        status: 'active',
        kycStatus: 'verified',
      },
    });

    if (!agent) {
      throw new ForbiddenException('You are not authorized as an agent');
    }

    request.agent = agent;
    return true;
  }
}
