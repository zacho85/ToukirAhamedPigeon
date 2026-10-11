import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OtpService } from '../otp/otp.service';
import { MailService } from '../mail/mail.service';
import {
  RegisterAgentDto,
  ApproveAgentDto,
  UpdateAgentDto,
  CashTransactionDto,
  ConfirmCashOutDto,
  StartDayDto,
  EndDayDto,
  UpdateAgentLimitsDto,
  WalletAdjustmentDto,
} from './dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AgentsService {
  /** Used when neither the admin setting nor AGENT_CASHOUT_OTP_THRESHOLD is set. */
  private static readonly DEFAULT_OTP_THRESHOLD = 500;

  constructor(
    private prisma: PrismaService,
    private otpService: OtpService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  /**
   * Amounts above this need the customer's OTP before any balance moves; at
   * or below it a cash-out completes immediately. Read on every request so an
   * admin change applies without a restart: admin setting, then the
   * AGENT_CASHOUT_OTP_THRESHOLD env var, then the default.
   */
  async getOtpThreshold(): Promise<{ value: number; source: 'admin' | 'env' | 'default' }> {
    const settings = await this.prisma.agentSettings.findUnique({ where: { id: 1 } });
    if (settings?.cashoutOtpThreshold != null) {
      return { value: settings.cashoutOtpThreshold, source: 'admin' };
    }
    const fromEnv = Number(this.configService.get<string>('AGENT_CASHOUT_OTP_THRESHOLD'));
    if (fromEnv > 0) return { value: fromEnv, source: 'env' };
    return { value: AgentsService.DEFAULT_OTP_THRESHOLD, source: 'default' };
  }

  async updateOtpThreshold(value: number, adminUserId: number) {
    await this.prisma.agentSettings.upsert({
      where: { id: 1 },
      update: { cashoutOtpThreshold: value, updatedBy: adminUserId },
      create: { id: 1, cashoutOtpThreshold: value, updatedBy: adminUserId },
    });
    return this.getOtpThreshold();
  }

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
    const pendingCount = await this.prisma.agentCashTransaction.count({
      where: {
        agentId: agent.id,
        status: 'pending',
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

  private async findActiveUserByEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('No user found with that email');
    if (user.status !== 'active') throw new BadRequestException('This user account is not active');
    return user;
  }

  private async assertWithinTransactionLimits(agentProfile: any, amount: number) {
    const maxPerTransaction = Number(agentProfile.maxTransactionAmount);
    if (amount > maxPerTransaction) {
      throw new BadRequestException(
        `This amount exceeds the maximum amount per transaction (${maxPerTransaction.toFixed(2)})`,
      );
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);

    // A pending cash-out holds its amount against the limits only while its
    // OTP can still be confirmed.
    const counted = {
      OR: [
        { status: 'completed' },
        {
          status: 'pending_otp',
          createdAt: { gte: new Date(Date.now() - AgentsService.PENDING_OTP_TTL_MS) },
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
      throw new BadRequestException('This transaction would exceed your daily transaction limit');
    }
    if (Number(monthlySum._sum.amount || 0) + amount > Number(agentProfile.monthlyTransactionLimit)) {
      throw new BadRequestException('This transaction would exceed your monthly transaction limit');
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

    if (p.commission > 0) {
      await tx.user.update({
        where: { id: p.agentProfile.userId },
        data: { walletBalance: { increment: p.commission } },
      });
      await tx.transaction.create({
        data: {
          transactionId: `${p.reference}-COM`,
          recipientId: p.agentProfile.userId,
          amount: p.commission,
          currency: 'USD',
          type: 'agent_commission',
          status: 'completed',
          paymentMethod: 'agent_commission',
          referenceNumber: p.reference,
          description: `Commission on ${isCashIn ? 'cash in' : 'cash out'} ${p.reference}`,
        },
      });
    }

    return tx.agentCashTransaction.update({
      where: { id: p.cashTransactionId },
      data: { transactionId: ledger.id },
    });
  }

  async processCashIn(agentProfile: any, dto: CashTransactionDto) {
    await this.getOpenDaySettlement(agentProfile.id);
    const user = await this.findActiveUserByEmail(dto.userEmail);
    const amount = this.toMoney(dto.amount);
    await this.assertWithinTransactionLimits(agentProfile, amount);

    const commission = this.toMoney((amount * Number(agentProfile.commissionRate)) / 100);
    const reference = this.generateReference('CI');

    return this.prisma.$transaction(async (tx) => {
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
        data: { walletBalance: { increment: amount } },
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
        reference,
        cashTransactionId: transaction.id,
      });
    });
  }

  async processCashOut(agentProfile: any, dto: CashTransactionDto) {
    await this.getOpenDaySettlement(agentProfile.id);
    const user = await this.findActiveUserByEmail(dto.userEmail);
    const amount = this.toMoney(dto.amount);
    await this.assertWithinTransactionLimits(agentProfile, amount);

    // Early checks so the agent gets a clear message before any OTP is sent.
    // finalizeCashOut enforces both again atomically.
    const { cashOnHand } = await this.prisma.agentProfile.findUniqueOrThrow({
      where: { id: agentProfile.id },
      select: { cashOnHand: true },
    });
    if (amount > Number(cashOnHand)) {
      throw new BadRequestException('Insufficient cash on hand to process this cash-out');
    }
    if (Number(user.walletBalance) < amount) {
      throw new BadRequestException("The user's wallet balance is insufficient for this cash-out");
    }

    const commission = this.toMoney((amount * Number(agentProfile.commissionRate)) / 100);
    const reference = this.generateReference('CO');

    const { value: otpThreshold } = await this.getOtpThreshold();
    if (amount <= otpThreshold) {
      return this.finalizeCashOut(agentProfile, user, amount, commission, reference, dto.notes);
    }

    // Above threshold: park it as pending and require the END USER (not the
    // agent) to confirm via OTP before any balance actually moves.
    const pending = await this.prisma.agentCashTransaction.create({
      data: {
        agentId: agentProfile.id,
        userId: user.id,
        type: 'cash_out',
        amount,
        commission,
        status: 'pending_otp',
        reference,
        description: dto.notes,
      },
    });

    await this.otpService.sendOtp(user.email, 'agent_cashout', user.id);

    return { ...pending, requiresOtp: true };
  }

  async confirmCashOut(agentProfile: any, transactionId: number, dto: ConfirmCashOutDto) {
    const pending = await this.prisma.agentCashTransaction.findUnique({ where: { id: transactionId } });
    if (!pending || pending.agentId !== agentProfile.id) {
      throw new NotFoundException('Pending cash-out not found');
    }
    if (pending.status !== 'pending_otp') {
      throw new BadRequestException('This cash-out is not awaiting OTP confirmation');
    }

    if (pending.createdAt.getTime() < Date.now() - AgentsService.PENDING_OTP_TTL_MS) {
      await this.prisma.agentCashTransaction.updateMany({
        where: { id: pending.id, status: 'pending_otp' },
        data: { status: 'expired' },
      });
      throw new BadRequestException({
        message: 'This cash-out has expired. Start a new one.',
        code: 'CASHOUT_EXPIRED',
      });
    }

    await this.getOpenDaySettlement(agentProfile.id);

    const user = await this.prisma.user.findUnique({ where: { id: pending.userId! } });
    if (!user) throw new NotFoundException('User not found');

    try {
      await this.otpService.verifyOtp(user.email, dto.code, 'agent_cashout');
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
          message: 'Too many incorrect codes. This cash-out has been cancelled.',
          code: 'CASHOUT_CANCELLED',
        });
      }
      const left = AgentsService.MAX_OTP_ATTEMPTS - otpAttempts;
      throw new BadRequestException(`Invalid OTP. ${left} attempt${left === 1 ? '' : 's'} left.`);
    }

    return this.finalizeCashOut(
      agentProfile,
      user,
      Number(pending.amount),
      Number(pending.commission),
      pending.reference,
      pending.description ?? undefined,
      pending.id,
    );
  }

  private async finalizeCashOut(
    agentProfile: any,
    user: any,
    amount: number,
    commission: number,
    reference: string,
    notes?: string,
    existingId?: number,
  ) {
    return this.prisma.$transaction(async (tx) => {
      let cashTransactionId: number;
      if (existingId) {
        // Claim the pending row: only one confirmation can ever complete it.
        const claimed = await tx.agentCashTransaction.updateMany({
          where: { id: existingId, status: 'pending_otp' },
          data: { status: 'completed', completedAt: new Date() },
        });
        if (claimed.count === 0) {
          throw new BadRequestException('This cash-out is not awaiting OTP confirmation');
        }
        cashTransactionId = existingId;
      } else {
        const created = await tx.agentCashTransaction.create({
          data: {
            agentId: agentProfile.id,
            userId: user.id,
            type: 'cash_out',
            amount,
            commission,
            status: 'completed',
            reference,
            description: notes,
            completedAt: new Date(),
          },
        });
        cashTransactionId = created.id;
      }

      const paidOut = await tx.agentProfile.updateMany({
        where: { id: agentProfile.id, cashOnHand: { gte: amount } },
        data: { cashOnHand: { decrement: amount } },
      });
      if (paidOut.count === 0) {
        throw new BadRequestException('Insufficient cash on hand to process this cash-out');
      }

      const debited = await tx.user.updateMany({
        where: { id: user.id, status: 'active', walletBalance: { gte: amount } },
        data: { walletBalance: { decrement: amount } },
      });
      if (debited.count === 0) {
        throw new BadRequestException("The user's wallet balance is insufficient for this cash-out");
      }

      return this.recordLedgerAndCommission(tx, {
        agentProfile,
        userId: user.id,
        type: 'cash_out',
        amount,
        commission,
        reference,
        cashTransactionId,
      });
    });
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

  async getOwnCashTransactions(agentId: number, limit = 50) {
    return this.prisma.agentCashTransaction.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}