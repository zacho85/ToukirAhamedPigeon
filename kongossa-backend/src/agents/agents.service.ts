import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OtpService } from '../otp/otp.service';
import { MailService } from '../mail/mail.service';
import { FeesService } from '../fees/fees.service';
import {
  RegisterAgentDto,
  ApproveAgentDto,
  UpdateAgentDto,
  CashTransactionDto,
  CustomerCashOutDto,
  StartDayDto,
  EndDayDto,
  UpdateAgentLimitsDto,
  WalletAdjustmentDto,
  AgentTransferDto,
} from './dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AgentsService {
  constructor(
    private prisma: PrismaService,
    private otpService: OtpService,
    private mailService: MailService,
    private fees: FeesService,
  ) {}

  /**
   * Admin action: change any of an agent's transaction limits. The merged
   * result must satisfy per-transaction <= daily <= monthly.
   */
  async updateAgentLimits(agentId: number, dto: UpdateAgentLimitsDto) {
    const agent = await this.prisma.agentProfile.findUnique({ where: { id: agentId } });
    if (!agent) throw new NotFoundException('Agent not found');

    const next = {
      dailyTransactionLimit: dto.dailyTransactionLimit ?? Number(agent.dailyTransactionLimit),
      monthlyTransactionLimit: dto.monthlyTransactionLimit ?? Number(agent.monthlyTransactionLimit),
      maxTransactionAmount: dto.maxTransactionAmount ?? Number(agent.maxTransactionAmount),
      maxCashOnHand: dto.maxCashOnHand ?? Number(agent.maxCashOnHand),
    };
    if (next.maxTransactionAmount > next.dailyTransactionLimit) {
      throw new BadRequestException('maxTransactionAmount cannot be greater than dailyTransactionLimit');
    }
    if (next.dailyTransactionLimit > next.monthlyTransactionLimit) {
      throw new BadRequestException('dailyTransactionLimit cannot be greater than monthlyTransactionLimit');
    }

    const updated = await this.prisma.agentProfile.update({
      where: { id: agentId },
      data: next,
      include: {
        user: { select: { id: true, email: true, fullName: true, phoneNumber: true, walletBalance: true } },
      },
    });

    const warning =
      Number(updated.cashOnHand) > next.maxCashOnHand
        ? `This agent currently holds ${Number(updated.cashOnHand).toFixed(2)} in cash, above the new maximum. ` +
          'New cash-ins are blocked until cash on hand drops below it.'
        : undefined;
    return { agent: updated, warning };
  }

  /**
   * Register a new agent
   */
  async registerAgent(dto: RegisterAgentDto) {
    // Check if user exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email },
          { phoneNumber: dto.phoneNumber },
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email or phone already exists');
    }

    // Generate unique agent code
    const agentCode = `AG-${Date.now().toString().slice(-8)}${uuidv4().slice(0, 4).toUpperCase()}`;

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    // Create user and agent profile in transaction
    const agentProfile = await this.prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          fullName: dto.fullName,
          phoneNumber: dto.phoneNumber,
          address: dto.address,
          country: dto.country,
          userType: 'agent',
          role: 'pending',
          status: 'active',
          walletBalance: 0,
          currency: 'USD',
          kycStatus: 'pending',
          approvalStatus: 'pending',
          agentStatus: 'pending',
          dateOfBirth: new Date('1990-01-01'), // You might want to add this to DTO
        },
      });

      // Create agent profile
      const agentProfile = await tx.agentProfile.create({
        data: {
          userId: user.id,
          agentCode,
          agentType: dto.agentType,
          businessName: dto.businessName,
          registrationNumber: dto.registrationNumber,
          taxId: dto.taxId,
          idType: dto.idType,
          idNumber: dto.idNumber,
          idFrontImage: dto.idFrontImage,
          idBackImage: dto.idBackImage,
          selfieImage: dto.selfieImage,
          addressProofImage: dto.addressProofImage,
          kycStatus: 'submitted',
          status: 'pending',
          commissionRate: 0, // Will be set on approval
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              phoneNumber: true,
              walletBalance: true,
            },
          },
        },
      });

      return agentProfile;
    });

    await this.sendAgentEmailSafely(() =>
      this.mailService.sendAgentApplicationReceivedEmail(
        dto.email,
        dto.fullName,
        agentCode,
      ),
    );

    return agentProfile;
  }

  /**
   * Get agent profile by user ID
   */
  async getAgentProfile(userId: number) {
    const agent = await this.prisma.agentProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phoneNumber: true,
            walletBalance: true,
            profileImage: true,
            createdAt: true,
          },
        },
        approvedByUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        cashTransactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        daySettlements: {
          take: 10,
          orderBy: { settlementDate: 'desc' },
        },
      },
    });

    if (!agent) {
      throw new NotFoundException('Agent profile not found');
    }

    return agent;
  }

  /**
   * Get agent by ID (for admin)
   */
  async getAgentById(agentId: number) {
    const agent = await this.prisma.agentProfile.findUnique({
      where: { id: agentId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phoneNumber: true,
            walletBalance: true,
            profileImage: true,
            createdAt: true,
          },
        },
        approvedByUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        cashTransactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        daySettlements: {
          take: 10,
          orderBy: { settlementDate: 'desc' },
        },
      },
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    return agent;
  }

  /**
   * Get agent dashboard statistics
   */
  async getDashboardStats(userId: number) {
    const agent = await this.prisma.agentProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            walletBalance: true,
          },
        },
      },
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 7);

    const monthStart = new Date(today);
    monthStart.setDate(monthStart.getDate() - 30);

    // Today's transactions
    const todayStats = await this.prisma.agentCashTransaction.aggregate({
      where: {
        agentId: agent.id,
        status: 'completed',
        completedAt: {
          gte: today,
        },
      },
      _count: true,
      _sum: {
        amount: true,
        feeAmount: true,
        commission: true,
      },
    });

    // Weekly stats
    const weekStats = await this.prisma.agentCashTransaction.aggregate({
      where: {
        agentId: agent.id,
        status: 'completed',
        completedAt: {
          gte: weekStart,
        },
      },
      _count: true,
      _sum: {
        amount: true,
        commission: true,
      },
    });

    // Monthly stats
    const monthStats = await this.prisma.agentCashTransaction.aggregate({
      where: {
        agentId: agent.id,
        status: 'completed',
        completedAt: {
          gte: monthStart,
        },
      },
      _count: true,
      _sum: {
        amount: true,
        commission: true,
      },
    });

    // Pending transactions
    // Requests still waiting for the customer's OTP or for the agent's cash.
    const pendingCount = await this.prisma.agentCashTransaction.count({
      where: {
        agentId: agent.id,
        OR: [
          {
            status: 'pending_otp',
            createdAt: { gte: new Date(Date.now() - AgentsService.PENDING_OTP_TTL_MS) },
          },
          {
            status: 'awaiting_agent',
            createdAt: { gte: new Date(Date.now() - AgentsService.CASH_OUT_REQUEST_TTL_MS) },
          },
        ],
      },
    });

    // Total transactions
    const totalStats = await this.prisma.agentCashTransaction.aggregate({
      where: {
        agentId: agent.id,
        status: 'completed',
      },
      _count: true,
      _sum: {
        amount: true,
        feeAmount: true,
        commission: true,
      },
    });

    return {
      walletBalance: Number(agent.user?.walletBalance || 0),
      cashOnHand: Number(agent.cashOnHand || 0),
      maxCashOnHand: Number(agent.maxCashOnHand || 0),
      
      today: {
        transactions: todayStats._count || 0,
        volume: Number(todayStats._sum.amount || 0),
        fees: Number(todayStats._sum.feeAmount || 0),
        commission: Number(todayStats._sum.commission || 0),
      },
      
      week: {
        transactions: weekStats._count || 0,
        volume: Number(weekStats._sum.amount || 0),
        commission: Number(weekStats._sum.commission || 0),
      },
      
      month: {
        transactions: monthStats._count || 0,
        volume: Number(monthStats._sum.amount || 0),
        commission: Number(monthStats._sum.commission || 0),
      },
      
      total: {
        transactions: totalStats._count || 0,
        volume: Number(totalStats._sum.amount || 0),
        fees: Number(totalStats._sum.feeAmount || 0),
        commission: Number(totalStats._sum.commission || 0),
      },
      
      pendingTransactions: pendingCount,
      status: agent.status,
      kycStatus: agent.kycStatus,
      agentCode: agent.agentCode,
    };
  }

  /**
   * Commission per calendar day (server time) for the last `days` days,
   * today first. Days without completed transactions are included as zero
   * so the list always has `days` rows.
   */
  async getDailyCommission(userId: number, days = 30) {
    const agent = await this.prisma.agentProfile.findUnique({ where: { userId }, select: { id: true } });
    if (!agent) throw new NotFoundException('Agent not found');

    const span = Math.min(Math.max(Math.floor(days) || 30, 1), 90);
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    from.setDate(from.getDate() - (span - 1));

    const rows = await this.prisma.agentCashTransaction.findMany({
      where: { agentId: agent.id, status: 'completed', completedAt: { gte: from } },
      select: { completedAt: true, commission: true },
    });

    const dayKey = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const byDay = new Map<string, { transactions: number; commission: number }>();
    for (const row of rows) {
      const key = dayKey(row.completedAt!);
      const day = byDay.get(key) ?? { transactions: 0, commission: 0 };
      day.transactions += 1;
      day.commission += Number(row.commission);
      byDay.set(key, day);
    }

    const result: { date: string; transactions: number; commission: number }[] = [];
    for (let i = 0; i < span; i++) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const key = dayKey(d);
      const day = byDay.get(key);
      result.push({
        date: key,
        transactions: day?.transactions ?? 0,
        commission: this.toMoney(day?.commission ?? 0),
      });
    }
    return result;
  }

  /**
   * Get all agents (admin only)
   */
  async getAllAgents(filters?: { 
    status?: string; 
    kycStatus?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.kycStatus) {
      where.kycStatus = filters.kycStatus;
    }

    if (filters?.search) {
      where.OR = [
        { agentCode: { contains: filters.search, mode: 'insensitive' } },
        { user: { fullName: { contains: filters.search, mode: 'insensitive' } } },
        { user: { email: { contains: filters.search, mode: 'insensitive' } } },
        { user: { phoneNumber: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    const [agents, total] = await Promise.all([
      this.prisma.agentProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              phoneNumber: true,
              walletBalance: true,
              profileImage: true,
              createdAt: true,
            },
          },
          approvedByUser: {
            select: {
              fullName: true,
              email: true,
            },
          },
          _count: {
            select: {
              cashTransactions: true,
              daySettlements: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      }),
      this.prisma.agentProfile.count({ where }),
    ]);

    return {
      data: agents,
      total,
      limit: filters?.limit || 50,
      offset: filters?.offset || 0,
    };
  }

  /**
   * Approve or reject agent application
   */
  async approveAgent(agentId: number, dto: ApproveAgentDto, adminUserId: number) {
    const agent = await this.prisma.agentProfile.findUnique({
      where: { id: agentId },
      include: { user: true },
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    // Only a pending application can be approved/rejected -- 'active' is
    // deliberately excluded even though the UI never re-shows this action
    // for an active agent, because re-running it crashed on a duplicate
    // UserRole unique-constraint violation (already-active agents already
    // hold the 'agent' role from their first approval).
    if (agent.status !== 'pending') {
      throw new BadRequestException(`Agent is already ${agent.status}`);
    }

    const updatedAgent = await this.prisma.$transaction(async (tx) => {
      const isApproved = dto.status === 'approved';

      const updatedAgent = await tx.agentProfile.update({
        where: { id: agentId },
        data: {
          status: isApproved ? 'active' : 'rejected',
          kycStatus: isApproved ? 'verified' : 'rejected',
          kycVerifiedAt: isApproved ? new Date() : null,
          kycRejectedAt: !isApproved ? new Date() : null,
          kycRejectionReason: !isApproved ? dto.rejectionReason : null,
          approvedAt: isApproved ? new Date() : null,
          approvedBy: isApproved ? adminUserId : null,
          commissionRate: isApproved ? 0.5 : 0, // Default 0.5% commission
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
          approvedByUser: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      });

      if (isApproved) {
        // Update user role and status
        await tx.user.update({
          where: { id: agent.userId },
          data: {
            approvalStatus: 'approved',
            agentStatus: 'active',
            role: 'agent',
          },
        });

        // Add agent role to user
        const role = await tx.role.findFirst({
          where: { name: 'agent' },
        });

        if (role) {
          await tx.userRole.create({
            data: {
              userId: agent.userId,
              roleId: role.id,
            },
          });
        }
      } else {
        // Update user status for rejected agent
        await tx.user.update({
          where: { id: agent.userId },
          data: {
            approvalStatus: 'rejected',
            agentStatus: 'inactive',
          },
        });
      }

      return updatedAgent;
    });

    if (dto.status === 'approved') {
      await this.sendAgentEmailSafely(() =>
        this.mailService.sendAgentApprovedEmail(
          updatedAgent.user.email,
          updatedAgent.user.fullName,
        ),
      );
    }

    return updatedAgent;
  }

  /**
   * Suspend an agent
   */
  async suspendAgent(agentId: number, reason?: string) {
    const agent = await this.prisma.agentProfile.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    if (agent.status === 'suspended') {
      throw new BadRequestException('Agent is already suspended');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedAgent = await tx.agentProfile.update({
        where: { id: agentId },
        data: {
          status: 'suspended',
          kycRejectionReason: reason || 'Agent suspended',
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
        },
      });

      await tx.user.update({
        where: { id: agent.userId },
        data: {
          status: 'inactive',
          agentStatus: 'suspended',
        },
      });

      return updatedAgent;
    });
  }

  /**
   * Activate a suspended agent
   */
  async activateAgent(agentId: number) {
    const agent = await this.prisma.agentProfile.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    if (agent.status !== 'suspended') {
      throw new BadRequestException('Agent is not suspended');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedAgent = await tx.agentProfile.update({
        where: { id: agentId },
        data: {
          status: 'active',
          kycRejectionReason: null,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
        },
      });

      await tx.user.update({
        where: { id: agent.userId },
        data: {
          status: 'active',
          agentStatus: 'active',
        },
      });

      return updatedAgent;
    });
  }

  /**
   * Update agent profile (self-service, via PATCH /agents/profile -- AgentGuard
   * only, identity not privilege). Deliberately does NOT honour
   * commissionRate/maxCashOnHand/dailyTransactionLimit/monthlyTransactionLimit
   * from the dto even though UpdateAgentDto still declares them: those are
   * admin-controlled business parameters (commission has its own admin-only
   * updateCommissionRate above), and this route has no permission check --
   * only AgentGuard's active+verified identity check -- so honouring them
   * here would let any agent silently raise their own commission rate or
   * transaction limits by calling this endpoint directly.
   */
  async updateAgentProfile(userId: number, dto: UpdateAgentDto) {
    const agent = await this.prisma.agentProfile.findUnique({
      where: { userId },
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    return this.prisma.agentProfile.update({
      where: { id: agent.id },
      data: {
        businessName: dto.businessName,
        registrationNumber: dto.registrationNumber,
        taxId: dto.taxId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phoneNumber: true,
            walletBalance: true,
          },
        },
      },
    });
  }

  /**
   * Update an agent's commission rate (admin action, keyed by AgentProfile.id
   * like approve/suspend/activate/getAgentById -- unlike updateAgentProfile
   * above, which is keyed by userId for the agent's own self-service route).
   */
  async updateCommissionRate(agentId: number, commissionRate: number) {
    const agent = await this.prisma.agentProfile.findUnique({ where: { id: agentId } });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    return this.prisma.agentProfile.update({
      where: { id: agentId },
      data: { commissionRate },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phoneNumber: true,
            walletBalance: true,
          },
        },
      },
    });
  }

  /**
   * Admin action: credit or debit an agent's wallet balance (not cash on
   * hand) with a required reason. The balance change, its ledger row and the
   * audit record are written together; a debit can never go below zero.
   */
  async adjustAgentWallet(agentId: number, dto: WalletAdjustmentDto, adminUserId: number) {
    const reason = dto.reason.trim();
    if (reason.length < 5) throw new BadRequestException('reason must be at least 5 characters');
    const amount = this.toMoney(dto.amount);
    const isCredit = dto.direction === 'credit';

    const agent = await this.prisma.agentProfile.findUnique({
      where: { id: agentId },
      select: { id: true, userId: true, agentCode: true },
    });
    if (!agent) throw new NotFoundException('Agent not found');

    return this.prisma.$transaction(async (tx) => {
      const moved = await tx.user.updateMany({
        where: { id: agent.userId, ...(isCredit ? {} : { walletBalance: { gte: amount } }) },
        data: { walletBalance: isCredit ? { increment: amount } : { decrement: amount } },
      });
      if (moved.count === 0) {
        throw new BadRequestException("The agent's wallet balance is insufficient for this debit");
      }
      const { walletBalance: balanceAfter } = await tx.user.findUniqueOrThrow({
        where: { id: agent.userId },
        select: { walletBalance: true },
      });

      const reference = this.generateReference(isCredit ? 'ADJC' : 'ADJD');
      const ledger = await tx.transaction.create({
        data: {
          transactionId: reference,
          senderId: isCredit ? null : agent.userId,
          recipientId: isCredit ? agent.userId : null,
          amount,
          currency: 'USD',
          type: isCredit ? 'admin_credit' : 'admin_debit',
          status: 'completed',
          paymentMethod: 'admin_adjustment',
          referenceNumber: reference,
          description: `Admin ${dto.direction}: ${reason}`,
        },
      });

      return tx.agentWalletAdjustment.create({
        data: {
          agentId: agent.id,
          adminUserId,
          direction: dto.direction,
          amount,
          reason,
          balanceBefore: this.toMoney(balanceAfter + (isCredit ? -amount : amount)),
          balanceAfter,
          transactionId: ledger.id,
        },
        include: { admin: { select: { id: true, fullName: true, email: true } } },
      });
    });
  }

  async getWalletAdjustments(agentId: number) {
    const exists = await this.prisma.agentProfile.findUnique({ where: { id: agentId }, select: { id: true } });
    if (!exists) throw new NotFoundException('Agent not found');
    return this.prisma.agentWalletAdjustment.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { admin: { select: { id: true, fullName: true, email: true } } },
    });
  }

  /**
   * Get agent code
   */
  async getAgentCode(userId: number): Promise<string> {
    const agent = await this.prisma.agentProfile.findUnique({
      where: { userId },
      select: { agentCode: true },
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    return agent.agentCode;
  }

  /**
   * Check if user is an agent
   */
  async isAgent(userId: number): Promise<boolean> {
    const agent = await this.prisma.agentProfile.findUnique({
      where: { userId },
      select: { id: true, status: true, kycStatus: true },
    });

    return agent !== null && agent.status === 'active' && agent.kycStatus === 'verified';
  }

  /**
   * Update cash on hand
   */
  async updateCashOnHand(agentId: number, amount: number) {
    const agent = await this.prisma.agentProfile.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    const newCashOnHand = Number(agent.cashOnHand) + amount;
    
    if (newCashOnHand < 0) {
      throw new BadRequestException('Insufficient cash on hand');
    }

    if (newCashOnHand > Number(agent.maxCashOnHand)) {
      throw new BadRequestException('Cash on hand exceeds maximum limit');
    }

    return this.prisma.agentProfile.update({
      where: { id: agentId },
      data: {
        cashOnHand: newCashOnHand,
      },
    });
  }

  // -----------------------------------------------------------------------
  // Cash In / Cash Out
  //
  // "Cash in" = the end user hands the agent physical cash, the agent credits
  // the user's digital wallet -- agent's cashOnHand goes UP.
  // "Cash out" = the reverse: the agent hands over physical cash, debiting
  // the user's digital wallet -- agent's cashOnHand goes DOWN.
  //
  // Every balance change happens inside one prisma.$transaction together with
  // a matching Transaction (ledger) row, so a wallet balance can always be
  // explained from its history. Balances move through conditional updates
  // (updateMany + a guard in `where` + a count check) instead of
  // read-compute-write, so two racing requests can never take cash on hand or
  // a wallet below zero, or cash on hand above its maximum.
  // -----------------------------------------------------------------------

  /** Same lifetime as the OTP itself (otp.service.ts); a pending cash-out expires with it. */
  private static readonly PENDING_OTP_TTL_MS = 10 * 60 * 1000;

  /** Wrong codes allowed on one pending cash-out before it is cancelled. */
  private static readonly MAX_OTP_ATTEMPTS = 5;

  /** A customer-approved cash-out waits this long (from creation) for the agent to hand over the cash. */
  private static readonly CASH_OUT_REQUEST_TTL_MS = 15 * 60 * 1000;

  private toMoney(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private async getOpenDaySettlement(agentId: number) {
    const open = await this.prisma.agentDaySettlement.findFirst({
      where: { agentId, status: 'open' },
    });
    if (!open) {
      throw new BadRequestException('Start your day before processing transactions');
    }
    return open;
  }

  /**
   * Finds a customer by KongossaPay ID (KP100001), phone number or email.
   * Phone numbers must be in international form (+237..., 237...), because a
   * local number like 0612... cannot be told apart between countries.
   */
  private async findUserByIdentifier(identifier: string) {
    const value = (identifier || '').trim();
    if (!value) return null;

    if (/^kp\d+$/i.test(value)) {
      return this.prisma.user.findUnique({ where: { kongossaId: value.toUpperCase() } });
    }
    if (value.includes('@')) {
      return this.prisma.user.findFirst({ where: { email: { equals: value, mode: 'insensitive' } } });
    }
    const digits = value.replace(/\D/g, '');
    if (digits.length < 8) return null;
    const international = digits.startsWith('00') ? digits.slice(2) : digits;
    return this.prisma.user.findFirst({
      where: { phoneNumber: { in: [value, `+${international}`, international, `00${international}`] } },
    });
  }

  private async findActiveUser(identifier: string, who = 'customer') {
    const user = await this.findUserByIdentifier(identifier);
    if (!user) {
      throw new NotFoundException(
        `No ${who} found with that KongossaPay ID, phone number or email. Phone numbers need the country code, e.g. +237...`,
      );
    }
    if (user.status !== 'active') throw new BadRequestException(`This ${who}'s account is not active`);
    return user;
  }

  /** `whose` words the messages for who is reading them: the agent, or a customer. */
  private async assertWithinTransactionLimits(agentProfile: any, amount: number, whose = 'your') {
    const maxPerTransaction = Number(agentProfile.maxTransactionAmount);
    if (amount > maxPerTransaction) {
      throw new BadRequestException(
        `This amount exceeds the maximum amount per transaction (${maxPerTransaction.toFixed(2)})`,
      );
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);

    // A pending request holds its amount against the limits only while it
    // can still complete.
    const counted = {
      OR: [
        { status: 'completed' },
        {
          status: 'pending_otp',
          createdAt: { gte: new Date(Date.now() - AgentsService.PENDING_OTP_TTL_MS) },
        },
        {
          status: 'awaiting_agent',
          createdAt: { gte: new Date(Date.now() - AgentsService.CASH_OUT_REQUEST_TTL_MS) },
        },
      ],
    };

    const [dailySum, monthlySum] = await Promise.all([
      this.prisma.agentCashTransaction.aggregate({
        where: { agentId: agentProfile.id, createdAt: { gte: todayStart }, ...counted },
        _sum: { amount: true },
      }),
      this.prisma.agentCashTransaction.aggregate({
        where: { agentId: agentProfile.id, createdAt: { gte: monthStart }, ...counted },
        _sum: { amount: true },
      }),
    ]);

    if (Number(dailySum._sum.amount || 0) + amount > Number(agentProfile.dailyTransactionLimit)) {
      throw new BadRequestException(`This transaction would exceed ${whose} daily transaction limit`);
    }
    if (Number(monthlySum._sum.amount || 0) + amount > Number(agentProfile.monthlyTransactionLimit)) {
      throw new BadRequestException(`This transaction would exceed ${whose} monthly transaction limit`);
    }
  }

  private generateReference(prefix: string): string {
    return `${prefix}-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`;
  }

  // A flaky SMTP relay should never fail a registration or approval that
  // otherwise succeeded -- log and move on rather than let the caller see
  // an error for a side effect they didn't ask about.
  private async sendAgentEmailSafely(send: () => Promise<unknown>) {
    try {
      await send();
    } catch (error) {
      console.error('Failed to send agent notification email:', error.message);
    }
  }

  /**
   * Writes the user's ledger row for a completed cash-in/out, links it to the
   * AgentCashTransaction, and credits the agent's commission with its own
   * ledger row. Must run inside the same $transaction as the balance changes.
   */
  private async recordLedgerAndCommission(
    tx: Prisma.TransactionClient,
    p: {
      agentProfile: any;
      userId: number;
      type: 'cash_in' | 'cash_out';
      amount: number;
      commission: number;
      /** Platform fee the customer pays; already debited from their wallet by the caller. */
      fee: number;
      reference: string;
      cashTransactionId: number;
    },
  ) {
    const isCashIn = p.type === 'cash_in';
    const ledger = await tx.transaction.create({
      data: {
        transactionId: p.reference,
        senderId: isCashIn ? null : p.userId,
        recipientId: isCashIn ? p.userId : null,
        amount: p.amount,
        currency: 'USD',
        type: isCashIn ? 'agent_cash_in' : 'agent_cash_out',
        status: 'completed',
        paymentMethod: 'agent_cash',
        referenceNumber: p.reference,
        description: `${isCashIn ? 'Cash in' : 'Cash out'} at agent ${p.agentProfile.agentCode}`,
      },
    });

    // Commission is paid out of the platform account, which collects the fees.
    await this.fees.payCommission(tx, {
      agentUserId: p.agentProfile.userId,
      commission: p.commission,
      reference: p.reference,
      description: `Commission on ${isCashIn ? 'cash in' : 'cash out'} ${p.reference}`,
    });

    await this.fees.recordFee(tx, {
      payerId: p.userId,
      fee: p.fee,
      reference: p.reference,
      description: `${isCashIn ? 'Deposit' : 'Withdrawal'} fee on ${p.reference}`,
    });

    return tx.agentCashTransaction.update({
      where: { id: p.cashTransactionId },
      data: { transactionId: ledger.id },
    });
  }

  async processCashIn(agentProfile: any, dto: CashTransactionDto) {
    await this.getOpenDaySettlement(agentProfile.id);
    const user = await this.findActiveUser(dto.customer);
    const amount = this.toMoney(dto.amount);
    await this.assertWithinTransactionLimits(agentProfile, amount);

    const commission = this.toMoney((amount * Number(agentProfile.commissionRate)) / 100);
    // A deposit fee (0% by default) comes out of the credited amount: the
    // agent receives the full cash, the wallet gets the rest.
    const fee = Math.min(await this.fees.depositFee(amount), amount);
    const reference = this.generateReference('CI');

    const completed = await this.prisma.$transaction(async (tx) => {
      // The profile AgentGuard attached may be stale; read the limit fresh.
      const { maxCashOnHand } = await tx.agentProfile.findUniqueOrThrow({
        where: { id: agentProfile.id },
        select: { maxCashOnHand: true },
      });
      const received = await tx.agentProfile.updateMany({
        where: {
          id: agentProfile.id,
          cashOnHand: { lte: this.toMoney(Number(maxCashOnHand) - amount) },
        },
        data: { cashOnHand: { increment: amount } },
      });
      if (received.count === 0) {
        throw new BadRequestException('This would exceed your maximum cash on hand');
      }

      const credited = await tx.user.updateMany({
        where: { id: user.id, status: 'active' },
        data: { walletBalance: { increment: this.toMoney(amount - fee) } },
      });
      if (credited.count === 0) {
        throw new BadRequestException('This user account is not active');
      }

      const transaction = await tx.agentCashTransaction.create({
        data: {
          agentId: agentProfile.id,
          userId: user.id,
          type: 'cash_in',
          amount,
          commission,
          feeAmount: fee,
          status: 'completed',
          reference,
          description: dto.notes,
          completedAt: new Date(),
        },
      });

      return this.recordLedgerAndCommission(tx, {
        agentProfile,
        userId: user.id,
        type: 'cash_in',
        amount,
        commission,
        fee,
        reference,
        cashTransactionId: transaction.id,
      });
    });

    const agentUser = await this.prisma.user.findUnique({
      where: { id: agentProfile.userId },
      select: { email: true, fullName: true },
    });
    const agentName = this.agentDisplayName({ ...agentProfile, user: agentUser });
    await this.sendReceipts([
      {
        to: user.email,
        title: 'Cash-in receipt',
        lines: [
          ['Amount received', this.formatMoney(amount)],
          ...(fee > 0
            ? ([
                ['Fee', this.formatMoney(fee)],
                ['Added to your wallet', this.formatMoney(this.toMoney(amount - fee))],
              ] as [string, string][])
            : []),
          ['Agent', agentName],
          ['Reference', reference],
          ['Date', this.receiptDate()],
        ],
      },
      agentUser && {
        to: agentUser.email,
        title: 'Cash-in completed',
        lines: [
          ['Cash received', this.formatMoney(amount)],
          ['Customer', user.fullName || user.email],
          ['Commission', this.formatMoney(commission)],
          ['Reference', reference],
          ['Date', this.receiptDate()],
        ],
      },
    ]);

    return completed;
  }

  // -----------------------------------------------------------------------
  // Cash-out and transfer: the customer consents to every debit
  //
  // An agent can never move money out of a customer's wallet. A cash-out is
  // started by the customer in their own app; an agent-assisted transfer is
  // started by the agent. Either way the debit waits for the customer's OTP,
  // which the customer enters in their own app, never on the agent's device.
  //
  // Statuses: pending_otp -> awaiting_agent (cash-out only) -> completed, or
  // expired / failed (too many wrong codes) / cancelled (by the customer) /
  // declined (by the agent). A transfer completes as soon as the OTP is right.
  // -----------------------------------------------------------------------

  private agentDisplayName(agent: {
    agentCode: string;
    businessName?: string | null;
    user?: { fullName?: string | null } | null;
  }): string {
    const name = agent.businessName || agent.user?.fullName;
    return name ? `${name} (${agent.agentCode})` : agent.agentCode;
  }

  private formatMoney(amount: number): string {
    return `$${Number(amount).toFixed(2)}`;
  }

  private receiptDate(): string {
    return `${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`;
  }

  /** Requests past their lifetime are marked expired so no list or claim treats them as live. */
  private async expireStaleRequests(where: { agentId?: number; userId?: number }) {
    const now = Date.now();
    await this.prisma.agentCashTransaction.updateMany({
      where: {
        ...where,
        OR: [
          { status: 'pending_otp', createdAt: { lt: new Date(now - AgentsService.PENDING_OTP_TTL_MS) } },
          {
            status: 'awaiting_agent',
            createdAt: { lt: new Date(now - AgentsService.CASH_OUT_REQUEST_TTL_MS) },
          },
        ],
      },
      data: { status: 'expired' },
    });
  }

  /** Sends the OTP for a pending debit; if the mail fails the request is closed, so nothing hangs. */
  private async sendDebitOtp(
    pendingId: number,
    user: { id: number; email: string },
    purpose: string,
    details: [string, string][],
  ) {
    try {
      await this.otpService.sendOtp(user.email, purpose, user.id, details);
    } catch (error) {
      console.error('Failed to send debit OTP:', error.message);
      await this.prisma.agentCashTransaction.updateMany({
        where: { id: pendingId, status: 'pending_otp' },
        data: { status: 'failed' },
      });
      throw new BadRequestException('Could not send the confirmation code. Please try again.');
    }
  }

  // --- Customer side (their own app) -------------------------------------

  async createCustomerCashOut(userId: number, dto: CustomerCashOutDto) {
    const agent = await this.prisma.agentProfile.findUnique({
      where: { agentCode: dto.agentCode.trim().toUpperCase() },
      include: { user: { select: { fullName: true } } },
    });
    if (!agent || agent.status !== 'active' || agent.kycStatus !== 'verified') {
      throw new NotFoundException('No active agent found with that code');
    }
    if (agent.userId === userId) {
      throw new BadRequestException('You cannot cash out at your own agent account');
    }
    const openDay = await this.prisma.agentDaySettlement.findFirst({
      where: { agentId: agent.id, status: 'open' },
    });
    if (!openDay) {
      throw new BadRequestException('This agent is not open for cash-out right now');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.status !== 'active') throw new BadRequestException('Your account is not active');

    const amount = this.toMoney(dto.amount);
    const fee = await this.fees.withdrawalFee(amount);
    const total = this.toMoney(amount + fee);
    if (Number(user.walletBalance) < total) {
      throw new BadRequestException(
        `Your wallet balance is insufficient for this cash-out (${this.formatMoney(amount)} + ${this.formatMoney(fee)} fee)`,
      );
    }
    await this.assertWithinTransactionLimits(agent, amount, "the agent's");
    if (amount > Number(agent.cashOnHand)) {
      throw new BadRequestException('This agent does not have enough cash for this amount');
    }

    const commission = this.toMoney((amount * Number(agent.commissionRate)) / 100);
    const reference = this.generateReference('CO');
    const pending = await this.prisma.agentCashTransaction.create({
      data: {
        agentId: agent.id,
        userId,
        type: 'cash_out',
        amount,
        commission,
        feeAmount: fee,
        status: 'pending_otp',
        reference,
        description: dto.notes,
      },
    });

    const agentName = this.agentDisplayName(agent);
    await this.sendDebitOtp(pending.id, user, 'agent_cashout', [
      ['Cash out', this.formatMoney(amount)],
      ['Fee', this.formatMoney(fee)],
      ['Total from your wallet', this.formatMoney(total)],
      ['Agent', agentName],
      ['Reference', reference],
    ]);

    return { id: pending.id, reference, amount, fee, total, status: pending.status, agentName };
  }

  /** The customer's code for their own pending cash-out or transfer. */
  async confirmCustomerRequest(userId: number, requestId: number, code: string) {
    const pending = await this.prisma.agentCashTransaction.findUnique({
      where: { id: requestId },
      include: { agent: { include: { user: { select: { fullName: true } } } } },
    });
    if (!pending || pending.userId !== userId || !['cash_out', 'transfer'].includes(pending.type)) {
      throw new NotFoundException('Request not found');
    }
    const isCashOut = pending.type === 'cash_out';
    const label = isCashOut ? 'cash-out' : 'transfer';
    const codePrefix = isCashOut ? 'CASHOUT' : 'TRANSFER';

    if (pending.status !== 'pending_otp') {
      throw new BadRequestException(`This ${label} is not waiting for your code`);
    }
    if (pending.createdAt.getTime() < Date.now() - AgentsService.PENDING_OTP_TTL_MS) {
      await this.prisma.agentCashTransaction.updateMany({
        where: { id: pending.id, status: 'pending_otp' },
        data: { status: 'expired' },
      });
      throw new BadRequestException({
        message: `This ${label} has expired. Start a new one.`,
        code: `${codePrefix}_EXPIRED`,
      });
    }

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    try {
      await this.otpService.verifyOtp(user.email, code, isCashOut ? 'agent_cashout' : 'agent_transfer');
    } catch (error) {
      if (!(error instanceof BadRequestException) || error.message !== 'Invalid OTP') throw error;

      const { otpAttempts } = await this.prisma.agentCashTransaction.update({
        where: { id: pending.id },
        data: { otpAttempts: { increment: 1 } },
      });
      if (otpAttempts >= AgentsService.MAX_OTP_ATTEMPTS) {
        await this.prisma.agentCashTransaction.updateMany({
          where: { id: pending.id, status: 'pending_otp' },
          data: { status: 'failed' },
        });
        throw new BadRequestException({
          message: `Too many incorrect codes. This ${label} has been cancelled.`,
          code: `${codePrefix}_CANCELLED`,
        });
      }
      const left = AgentsService.MAX_OTP_ATTEMPTS - otpAttempts;
      throw new BadRequestException(`Invalid OTP. ${left} attempt${left === 1 ? '' : 's'} left.`);
    }

    if (!isCashOut) {
      return this.finalizeTransfer(
        pending.agent,
        pending.userId!,
        pending.counterpartyUserId!,
        Number(pending.amount),
        Number(pending.feeAmount),
        pending.reference,
        pending.id,
      );
    }

    // Consent given; the money moves only when the agent hands over the cash.
    const approved = await this.prisma.agentCashTransaction.updateMany({
      where: { id: pending.id, status: 'pending_otp' },
      data: { status: 'awaiting_agent' },
    });
    if (approved.count === 0) {
      throw new BadRequestException('This cash-out is not waiting for your code');
    }
    return this.getCustomerRequest(userId, pending.id);
  }

  async cancelCustomerRequest(userId: number, requestId: number) {
    const cancelled = await this.prisma.agentCashTransaction.updateMany({
      where: { id: requestId, userId, status: { in: ['pending_otp', 'awaiting_agent'] } },
      data: { status: 'cancelled' },
    });
    if (cancelled.count === 0) {
      throw new BadRequestException('This request can no longer be cancelled');
    }
    return this.getCustomerRequest(userId, requestId);
  }

  private async toCustomerRequestView(rows: any[]) {
    const recipientIds = rows.map((r) => r.counterpartyUserId).filter(Boolean);
    const recipients = recipientIds.length
      ? await this.prisma.user.findMany({
          where: { id: { in: recipientIds } },
          select: { id: true, fullName: true, email: true },
        })
      : [];
    return rows.map((r) => {
      const recipient = recipients.find((u) => u.id === r.counterpartyUserId);
      const ttl =
        r.status === 'awaiting_agent' ? AgentsService.CASH_OUT_REQUEST_TTL_MS : AgentsService.PENDING_OTP_TTL_MS;
      return {
        id: r.id,
        type: r.type,
        status: r.status,
        amount: Number(r.amount),
        fee: Number(r.feeAmount),
        total: this.toMoney(Number(r.amount) + Number(r.feeAmount)),
        reference: r.reference,
        createdAt: r.createdAt,
        completedAt: r.completedAt,
        expiresAt: new Date(r.createdAt.getTime() + ttl),
        agentName: this.agentDisplayName(r.agent),
        recipient: recipient ? { fullName: recipient.fullName, email: recipient.email } : null,
      };
    });
  }

  /** The customer's live requests: codes still to enter and cash-outs waiting for the agent. */
  async getCustomerRequests(userId: number) {
    await this.expireStaleRequests({ userId });
    const rows = await this.prisma.agentCashTransaction.findMany({
      where: { userId, type: { in: ['cash_out', 'transfer'] }, status: { in: ['pending_otp', 'awaiting_agent'] } },
      include: { agent: { include: { user: { select: { fullName: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
    return this.toCustomerRequestView(rows);
  }

  async getCustomerRequest(userId: number, requestId: number) {
    await this.expireStaleRequests({ userId });
    const row = await this.prisma.agentCashTransaction.findUnique({
      where: { id: requestId },
      include: { agent: { include: { user: { select: { fullName: true } } } } },
    });
    if (!row || row.userId !== userId) throw new NotFoundException('Request not found');
    const [view] = await this.toCustomerRequestView([row]);
    return view;
  }

  // --- Agent side ----------------------------------------------------------

  /** Cash-outs the customer has approved, waiting for the agent to hand over the cash. */
  async getCashOutRequests(agentProfile: any) {
    await this.expireStaleRequests({ agentId: agentProfile.id });
    const rows = await this.prisma.agentCashTransaction.findMany({
      where: { agentId: agentProfile.id, type: 'cash_out', status: 'awaiting_agent' },
      include: { user: { select: { fullName: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((r) => ({
      id: r.id,
      amount: Number(r.amount),
      commission: Number(r.commission),
      reference: r.reference,
      notes: r.description,
      createdAt: r.createdAt,
      expiresAt: new Date(r.createdAt.getTime() + AgentsService.CASH_OUT_REQUEST_TTL_MS),
      customer: r.user ? { fullName: r.user.fullName, email: r.user.email } : null,
    }));
  }

  /** The agent has handed over the cash: now, and only now, the wallet is debited. */
  async completeCashOut(agentProfile: any, requestId: number) {
    await this.getOpenDaySettlement(agentProfile.id);
    const request = await this.prisma.agentCashTransaction.findUnique({ where: { id: requestId } });
    if (!request || request.agentId !== agentProfile.id || request.type !== 'cash_out') {
      throw new NotFoundException('Cash-out request not found');
    }
    if (request.status !== 'awaiting_agent') {
      throw new BadRequestException(
        request.status === 'pending_otp'
          ? "This cash-out is still waiting for the customer's confirmation"
          : 'This cash-out request is no longer open',
      );
    }
    if (request.createdAt.getTime() < Date.now() - AgentsService.CASH_OUT_REQUEST_TTL_MS) {
      await this.prisma.agentCashTransaction.updateMany({
        where: { id: request.id, status: 'awaiting_agent' },
        data: { status: 'expired' },
      });
      throw new BadRequestException({
        message: 'This cash-out request has expired. Ask the customer to start a new one.',
        code: 'CASHOUT_EXPIRED',
      });
    }

    const completed = await this.finalizeCashOut(agentProfile, request);

    const [customer, agentUser] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: request.userId! }, select: { email: true, fullName: true } }),
      this.prisma.user.findUnique({ where: { id: agentProfile.userId }, select: { email: true, fullName: true } }),
    ]);
    const amount = Number(request.amount);
    const agentName = this.agentDisplayName({ ...agentProfile, user: agentUser });
    await this.sendReceipts([
      customer && {
        to: customer.email,
        title: 'Cash-out receipt',
        lines: [
          ['Amount paid out', this.formatMoney(amount)],
          ['Fee', this.formatMoney(Number(request.feeAmount))],
          ['Total from your wallet', this.formatMoney(this.toMoney(amount + Number(request.feeAmount)))],
          ['Agent', agentName],
          ['Reference', request.reference],
          ['Date', this.receiptDate()],
        ],
      },
      agentUser && {
        to: agentUser.email,
        title: 'Cash-out completed',
        lines: [
          ['Cash given', this.formatMoney(amount)],
          ['Customer', customer?.fullName || customer?.email || '-'],
          ['Commission', this.formatMoney(Number(request.commission))],
          ['Reference', request.reference],
          ['Date', this.receiptDate()],
        ],
      },
    ]);

    return completed;
  }

  async declineCashOut(agentProfile: any, requestId: number) {
    const declined = await this.prisma.agentCashTransaction.updateMany({
      where: { id: requestId, agentId: agentProfile.id, type: 'cash_out', status: 'awaiting_agent' },
      data: { status: 'declined' },
    });
    if (declined.count === 0) {
      throw new BadRequestException('This cash-out request is no longer open');
    }
    return this.prisma.agentCashTransaction.findUnique({ where: { id: requestId } });
  }

  private async finalizeCashOut(
    agentProfile: any,
    request: { id: number; userId: number | null; amount: unknown; commission: unknown; feeAmount: unknown; reference: string },
  ) {
    const amount = Number(request.amount);
    const commission = Number(request.commission);
    const fee = Number(request.feeAmount);
    const total = this.toMoney(amount + fee);

    return this.prisma.$transaction(async (tx) => {
      // Claim the request: only one "Cash given" can ever complete it, and
      // not after the customer cancelled or it expired.
      const claimed = await tx.agentCashTransaction.updateMany({
        where: {
          id: request.id,
          status: 'awaiting_agent',
          createdAt: { gte: new Date(Date.now() - AgentsService.CASH_OUT_REQUEST_TTL_MS) },
        },
        data: { status: 'completed', completedAt: new Date() },
      });
      if (claimed.count === 0) {
        throw new BadRequestException('This cash-out request is no longer open');
      }

      const paidOut = await tx.agentProfile.updateMany({
        where: { id: agentProfile.id, cashOnHand: { gte: amount } },
        data: { cashOnHand: { decrement: amount } },
      });
      if (paidOut.count === 0) {
        throw new BadRequestException('Insufficient cash on hand to process this cash-out');
      }

      // The customer pays the cash-out fee on top of the cash they receive.
      const debited = await tx.user.updateMany({
        where: { id: request.userId!, status: 'active', walletBalance: { gte: total } },
        data: { walletBalance: { decrement: total } },
      });
      if (debited.count === 0) {
        throw new BadRequestException("The customer's wallet balance is insufficient for this cash-out");
      }

      return this.recordLedgerAndCommission(tx, {
        agentProfile,
        userId: request.userId!,
        type: 'cash_out',
        amount,
        commission,
        fee,
        reference: request.reference,
        cashTransactionId: request.id,
      });
    });
  }

  private async sendReceipts(receipts: ({ to: string; title: string; lines: [string, string][] } | null | undefined)[]) {
    for (const r of receipts) {
      if (r) await this.sendAgentEmailSafely(() => this.mailService.sendReceiptEmail(r.to, r.title, r.lines));
    }
  }

  // -----------------------------------------------------------------------
  // Agent-assisted transfer
  //
  // The agent helps a customer send money from their wallet to another
  // customer's wallet. No physical cash moves, so cash on hand is untouched
  // and no commission is earned. The amount still counts toward the agent's
  // limits. The SENDER approves every transfer with an OTP in their own app.
  // AgentCashTransaction.userId is the sender, counterpartyUserId the recipient.
  // -----------------------------------------------------------------------

  /** Lookup by KongossaPay ID, phone or email, so the agent can confirm who they are dealing with. */
  async lookupUser(identifier: string) {
    const user = await this.findUserByIdentifier(identifier);
    if (!user) {
      throw new NotFoundException(
        'No customer found with that KongossaPay ID, phone number or email. Phone numbers need the country code, e.g. +237...',
      );
    }
    return {
      kongossaId: user.kongossaId,
      email: user.email,
      phoneNumber: user.phoneNumber,
      fullName: user.fullName,
      active: user.status === 'active',
    };
  }

  /** The fee the sender would pay, so the agent can show it on the review screen. */
  async quoteTransfer(sender: string, amountRaw: number) {
    const user = await this.findActiveUser(sender, 'sender');
    const amount = this.toMoney(amountRaw);
    if (!(amount > 0)) throw new BadRequestException('amount must be a positive number');
    const { fee, freeLeft } = await this.fees.transferFee(user.id, amount);
    return { amount, fee, total: this.toMoney(amount + fee), freeLeft };
  }

  async processTransfer(agentProfile: any, dto: AgentTransferDto) {
    await this.getOpenDaySettlement(agentProfile.id);
    const sender = await this.findActiveUser(dto.sender, 'sender');
    const recipient = await this.findActiveUser(dto.recipient, 'recipient');
    if (sender.id === recipient.id) {
      throw new BadRequestException('Sender and recipient must be different users');
    }

    const amount = this.toMoney(dto.amount);
    await this.assertWithinTransactionLimits(agentProfile, amount);
    const { fee } = await this.fees.transferFee(sender.id, amount);
    const total = this.toMoney(amount + fee);
    if (Number(sender.walletBalance) < total) {
      throw new BadRequestException(
        `The sender's wallet balance is insufficient for this transfer (${this.formatMoney(amount)} + ${this.formatMoney(fee)} fee)`,
      );
    }

    const reference = this.generateReference('TR');
    const pending = await this.prisma.agentCashTransaction.create({
      data: {
        agentId: agentProfile.id,
        userId: sender.id,
        counterpartyUserId: recipient.id,
        type: 'transfer',
        amount,
        commission: 0,
        feeAmount: fee,
        status: 'pending_otp',
        reference,
        description: dto.notes,
      },
    });

    const agentUser = await this.prisma.user.findUnique({
      where: { id: agentProfile.userId },
      select: { fullName: true },
    });
    await this.sendDebitOtp(pending.id, sender, 'agent_transfer', [
      ['Transfer', this.formatMoney(amount)],
      ['Fee', this.formatMoney(fee)],
      ['Total from your wallet', this.formatMoney(total)],
      ['To', recipient.fullName || recipient.email],
      ['Agent', this.agentDisplayName({ ...agentProfile, user: agentUser })],
      ['Reference', reference],
    ]);

    return { ...pending, fee, total, requiresCustomerApproval: true, senderName: sender.fullName };
  }

  private async finalizeTransfer(
    agentProfile: any,
    senderId: number,
    recipientId: number,
    amount: number,
    fee: number,
    reference: string,
    pendingId: number,
  ) {
    const total = this.toMoney(amount + fee);
    const completed = await this.prisma.$transaction(async (tx) => {
      // Claim the pending row: only one confirmation can ever complete it.
      const claimed = await tx.agentCashTransaction.updateMany({
        where: { id: pendingId, status: 'pending_otp' },
        data: { status: 'completed', completedAt: new Date() },
      });
      if (claimed.count === 0) {
        throw new BadRequestException('This transfer is not waiting for your code');
      }

      // The sender pays the fee on top; the recipient gets the full amount.
      const debited = await tx.user.updateMany({
        where: { id: senderId, status: 'active', walletBalance: { gte: total } },
        data: { walletBalance: { decrement: total } },
      });
      if (debited.count === 0) {
        throw new BadRequestException("The sender's wallet balance is insufficient for this transfer");
      }
      const credited = await tx.user.updateMany({
        where: { id: recipientId, status: 'active' },
        data: { walletBalance: { increment: amount } },
      });
      if (credited.count === 0) {
        throw new BadRequestException('The recipient account is not active');
      }

      const ledger = await tx.transaction.create({
        data: {
          transactionId: reference,
          senderId,
          recipientId,
          amount,
          currency: 'USD',
          type: 'agent_transfer',
          status: 'completed',
          paymentMethod: 'agent_transfer',
          referenceNumber: reference,
          description: `Transfer via agent ${agentProfile.agentCode}`,
        },
      });

      await this.fees.recordFee(tx, {
        payerId: senderId,
        fee,
        reference,
        description: `Transfer fee on ${reference}`,
      });

      return tx.agentCashTransaction.update({
        where: { id: pendingId },
        data: { transactionId: ledger.id },
      });
    });

    const [sender, recipient, agentUser] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: senderId }, select: { email: true, fullName: true } }),
      this.prisma.user.findUnique({ where: { id: recipientId }, select: { email: true, fullName: true } }),
      this.prisma.user.findUnique({ where: { id: agentProfile.userId }, select: { email: true, fullName: true } }),
    ]);
    const agentName = this.agentDisplayName({ ...agentProfile, user: agentUser });
    const common: [string, string][] = [
      ['Agent', agentName],
      ['Reference', reference],
      ['Date', this.receiptDate()],
    ];
    await this.sendReceipts([
      sender && {
        to: sender.email,
        title: 'Transfer receipt',
        lines: [
          ['Amount sent', this.formatMoney(amount)],
          ['Fee', this.formatMoney(fee)],
          ['Total from your wallet', this.formatMoney(total)],
          ['To', recipient?.fullName || recipient?.email || '-'],
          ...common,
        ],
      },
      recipient && {
        to: recipient.email,
        title: 'Money received',
        lines: [['Amount received', this.formatMoney(amount)], ['From', sender?.fullName || sender?.email || '-'], ...common],
      },
      agentUser && {
        to: agentUser.email,
        title: 'Transfer completed',
        lines: [
          ['Amount', this.formatMoney(amount)],
          ['From', sender?.fullName || sender?.email || '-'],
          ['To', recipient?.fullName || recipient?.email || '-'],
          ['Reference', reference],
          ['Date', this.receiptDate()],
        ],
      },
    ]);

    return completed;
  }

  // -----------------------------------------------------------------------
  // Day settlement
  //
  // The counted opening cash becomes the agent's cash on hand, and the
  // counted closing cash replaces it at the end of the day, so during a day
  // cashOnHand is always opening + cash in - cash out.
  // -----------------------------------------------------------------------

  async startDay(agentProfile: any, dto: StartDayDto) {
    const startCash = this.toMoney(dto.startCash);

    const existing = await this.prisma.agentDaySettlement.findFirst({
      where: { agentId: agentProfile.id, status: 'open' },
    });
    if (existing) {
      throw new BadRequestException('A day is already open -- end it before starting a new one');
    }

    const { maxCashOnHand } = await this.prisma.agentProfile.findUniqueOrThrow({
      where: { id: agentProfile.id },
      select: { maxCashOnHand: true },
    });
    if (startCash > Number(maxCashOnHand)) {
      throw new BadRequestException(
        'Opening cash exceeds your maximum cash on hand. Contact an administrator to raise the limit.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const settlement = await tx.agentDaySettlement.create({
        data: {
          agentId: agentProfile.id,
          startCash,
          endCash: 0,
          expectedEndCash: startCash,
          variance: 0,
          status: 'open',
        },
      });
      await tx.agentProfile.update({
        where: { id: agentProfile.id },
        data: { cashOnHand: startCash },
      });
      return settlement;
    });
  }

  /**
   * Running totals of an open day: what End Day would record if the agent
   * closed it right now. Shared by End Day and the admin inventory view so
   * both always show the same numbers.
   */
  private async getDayTotals(open: { agentId: number; settlementDate: Date; startCash: unknown }) {
    const since = { agentId: open.agentId, status: 'completed', createdAt: { gte: open.settlementDate } };
    const [cashInSum, cashOutSum, totals] = await Promise.all([
      this.prisma.agentCashTransaction.aggregate({ where: { ...since, type: 'cash_in' }, _sum: { amount: true } }),
      this.prisma.agentCashTransaction.aggregate({ where: { ...since, type: 'cash_out' }, _sum: { amount: true } }),
      this.prisma.agentCashTransaction.aggregate({
        where: since,
        _count: true,
        _sum: { commission: true, feeAmount: true },
      }),
    ]);

    const totalCashIn = Number(cashInSum._sum.amount || 0);
    const totalCashOut = Number(cashOutSum._sum.amount || 0);
    return {
      totalCashIn,
      totalCashOut,
      totalCommission: Number(totals._sum.commission || 0),
      totalFeeEarned: Number(totals._sum.feeAmount || 0),
      transactions: totals._count,
      expectedCash: this.toMoney(Number(open.startCash) + totalCashIn - totalCashOut),
    };
  }

  async endDay(agentProfile: any, dto: EndDayDto) {
    const open = await this.getOpenDaySettlement(agentProfile.id);
    const endCash = this.toMoney(dto.endCash);

    const { totalCashIn, totalCashOut, totalCommission, totalFeeEarned, expectedCash: expectedEndCash } =
      await this.getDayTotals(open);
    const variance = this.toMoney(endCash - expectedEndCash);

    return this.prisma.$transaction(async (tx) => {
      // A cash-out still waiting for its OTP cannot be confirmed into a closed day.
      await tx.agentCashTransaction.updateMany({
        where: { agentId: agentProfile.id, status: 'pending_otp' },
        data: { status: 'expired' },
      });
      await tx.agentProfile.update({
        where: { id: agentProfile.id },
        data: { cashOnHand: endCash },
      });
      return tx.agentDaySettlement.update({
        where: { id: open.id },
        data: {
          endCash,
          totalCashIn,
          totalCashOut,
          totalCommission,
          totalFeeEarned,
          expectedEndCash,
          variance,
          status: 'settled',
          settledAt: new Date(),
          notes: dto.notes,
        },
      });
    });
  }

  async getCurrentDaySettlement(agentId: number) {
    return this.prisma.agentDaySettlement.findFirst({ where: { agentId, status: 'open' } });
  }

  async getDaySettlements(agentId: number, limit = 30) {
    return this.prisma.agentDaySettlement.findMany({
      where: { agentId },
      orderBy: { settlementDate: 'desc' },
      take: limit,
    });
  }

  /**
   * Admin view of an agent's cash: what they hold now and, if their day is
   * open, the running totals of that day.
   */
  async getAgentInventory(agentId: number) {
    const agent = await this.prisma.agentProfile.findUnique({
      where: { id: agentId },
      select: { id: true, agentCode: true, cashOnHand: true, maxCashOnHand: true },
    });
    if (!agent) throw new NotFoundException('Agent not found');

    const open = await this.getCurrentDaySettlement(agentId);
    return {
      agentId: agent.id,
      agentCode: agent.agentCode,
      cashOnHand: Number(agent.cashOnHand),
      maxCashOnHand: Number(agent.maxCashOnHand),
      currentDay: open
        ? {
            id: open.id,
            startedAt: open.settlementDate,
            startCash: Number(open.startCash),
            ...(await this.getDayTotals(open)),
          }
        : null,
    };
  }

  async getAgentDayHistory(agentId: number) {
    const exists = await this.prisma.agentProfile.findUnique({ where: { id: agentId }, select: { id: true } });
    if (!exists) throw new NotFoundException('Agent not found');
    return this.getDaySettlements(agentId);
  }

  /** One of the agent's own rows, e.g. to follow a transfer waiting for the sender. */
  async getOwnCashTransaction(agentId: number, id: number) {
    await this.expireStaleRequests({ agentId });
    const row = await this.prisma.agentCashTransaction.findFirst({ where: { id, agentId } });
    if (!row) throw new NotFoundException('Transaction not found');
    return row;
  }

  async getOwnCashTransactions(agentId: number, limit = 50) {
    return this.prisma.agentCashTransaction.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}