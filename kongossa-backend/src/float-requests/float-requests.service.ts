import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFloatRequestDto } from './dto/create-float-request.dto';
import { ReviewFloatRequestDto } from './dto/review-float-request.dto';

const AGENT_SELECT = { id: true, fullName: true, email: true } as const;

@Injectable()
export class FloatRequestsService {
  constructor(private prisma: PrismaService) {}

  // FloatRequest.agentId is a User.id (see schema.prisma's FloatRequestAgent
  // relation), not an AgentProfile.id -- always resolve AgentProfile via
  // userId when this needs to touch cashOnHand.
  async createForAgent(userId: number, dto: CreateFloatRequestDto) {
    return this.prisma.floatRequest.create({
      data: {
        agentId: userId,
        amount: dto.amount,
        currency: dto.currency,
        notes: dto.notes,
        status: 'pending',
      },
    });
  }

  async findAllForAgent(userId: number, status?: string) {
    return this.prisma.floatRequest.findMany({
      where: { agentId: userId, ...(status && { status }) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(filters?: { agentId?: number; status?: string }) {
    return this.prisma.floatRequest.findMany({
      where: {
        ...(filters?.agentId && { agentId: filters.agentId }),
        ...(filters?.status && { status: filters.status }),
      },
      include: { agent: { select: AGENT_SELECT } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const floatRequest = await this.prisma.floatRequest.findUnique({
      where: { id },
      include: { agent: { select: AGENT_SELECT } },
    });
    if (!floatRequest) throw new NotFoundException('Float request not found');
    return floatRequest;
  }

  // Approving is bookkeeping only: it increments AgentProfile.cashOnHand as a
  // ledger entry. Whether the agent actually received real cash from the
  // company is reconciled offline, the same trust model as
  // AgentDaySettlement's variance field.
  async review(id: number, dto: ReviewFloatRequestDto) {
    const floatRequest = await this.findOne(id);
    if (floatRequest.status !== 'pending') {
      throw new BadRequestException('Only a pending float request can be reviewed');
    }

    if (dto.status === 'rejected') {
      return this.prisma.floatRequest.update({
        where: { id },
        data: { status: 'rejected', notes: dto.notes ?? floatRequest.notes },
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.floatRequest.update({
        where: { id },
        data: { status: 'approved', notes: dto.notes ?? floatRequest.notes },
      });
      await tx.agentProfile.update({
        where: { userId: floatRequest.agentId },
        data: { cashOnHand: { increment: floatRequest.amount } },
      });
      return updated;
    });
  }
}
