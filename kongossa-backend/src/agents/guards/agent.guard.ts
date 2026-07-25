import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AgentGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user has an agent profile and is active
    const agent = await this.prisma.agentProfile.findFirst({
      where: {
        userId: user.id,
        status: 'active',
        kycStatus: 'verified',
      },
    });

    if (!agent) {
      throw new ForbiddenException('You are not authorized as an agent');
    }

    // Attach agent to request
    request.agent = agent;
    return true;
  }
}