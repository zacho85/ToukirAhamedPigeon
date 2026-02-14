import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTontineContributionDto } from './dto/create-tontine-contribution.dto';
import { UpdateTontineContributionDto } from './dto/update-tontine-contribution.dto';
import { StripeService } from 'src/stripe/stripe.service';

@Injectable()
export class TontineContributionsService {
  constructor(private readonly prisma: PrismaService, private readonly stripe: StripeService) {}

  async create(dto: CreateTontineContributionDto) {
    return this.prisma.tontineContribution.create({
      data: {
        ...dto,
        status: dto.status ?? 'pending', // default to 'pending'
      },
    });
  }

  async findAll(query: any) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  // Filters
  if (query.tontine_id) {
    where.tontineMember = { tontineId: Number(query.tontine_id) };
  }
  if (query.user_id) {
    where.tontineMember = { ...where.tontineMember, userId: Number(query.user_id) };
  }
  if (query.status) {
    if(query.status=='paid'){
      where.status = 'completed';
    }else{
      where.status = query.status;
    }
  }
  if (query.search) {
    where.OR = [
      { tontineMember: { user: { name: { contains: query.search, mode: "insensitive" } } } },
      { amount: { contains: query.search } }, // optional search by amount
    ];
  }

  const [data, total] = await Promise.all([
    this.prisma.tontineContribution.findMany({
      where,
      include: {
        tontineMember: {
          include: {
            user: true,
            tontine: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { contributionDate: 'desc' },
    }),
    this.prisma.tontineContribution.count({ where }),
  ]);

  const last_page = Math.ceil(total / limit);

  return {
    data,
    current_page: page,
    last_page,
    per_page: limit,
    total,
  };
}


  async findOne(id: number) {
    const contribution = await this.prisma.tontineContribution.findUnique({
      where: { id },
      include: {
        user: true,
        tontineMember: {
          include: { tontine: true }
        }
      }
    });
    if (!contribution) throw new NotFoundException('Contribution not found');
    return contribution;
  }

  async update(id: number, dto: UpdateTontineContributionDto) {
    await this.findOne(id);
    return this.prisma.tontineContribution.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.tontineContribution.delete({ where: { id } });
  }

  async markAsPaid(id: number) {
    return this.update(id, { status: 'paid' });
  }

  async markAsLate(id: number) {
    return this.update(id, { status: 'late' });
  }

  async stats(tontineId: number) {
    return this.prisma.tontineContribution.aggregate({
      where: { tontineMember: { tontineId } },
      _sum: { amount: true },
      _count: { id: true },
    });
  }
  
   async findByTontine(tontineId: number, query: any) {
    const tontine = await this.prisma.tontine.findUnique({
      where: { id: tontineId },
    });
    if (!tontine) throw new NotFoundException('Tontine not found');

    const where: any = { tontineMember: { tontineId } };
    if (query.userId) where.userId = Number(query.userId);
    if (query.status) where.status = query.status;

    return this.prisma.tontineContribution.findMany({
      where,
      include: {
        user: true,
        tontineMember: { include: { tontine: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

   async retrieveStripeSession(sessionId: string) {
    try {
      return await this.stripe.client.checkout.sessions.retrieve(sessionId);
    } catch {
      return null;
    }
  }

  async createContributionFromStripe(data: {
    tontineId: number;
    userId: number;
    amount: number;
    status: string;
    paymentMethod: string;
    stripeSessionId?: string; // add optional field
  }) {
    // Prevent multiple entries for same Stripe session
    if (data.stripeSessionId) {
      const existing = await this.prisma.tontineContribution.findFirst({
        where: { stripeSessionId: data.stripeSessionId },
      });
      if (existing) return existing; // return existing record instead of creating new
    }

    const tontineMember = await this.prisma.tontineMember.findFirst({
      where: { userId: data.userId, tontineId: data.tontineId },
    });

    if (!tontineMember) throw new Error("Tontine member not found");

    return this.prisma.tontineContribution.create({
      data: {
        tontineMemberId: tontineMember.id,
        userId: data.userId,
        amount: data.amount,
        status: data.status,
        contributionDate: new Date(),
        paymentMethod: data.paymentMethod || null,
        stripeSessionId: data.stripeSessionId || null, // store sessionId
      },
    });
  }

}
