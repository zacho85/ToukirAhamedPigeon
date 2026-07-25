import { 
  Injectable, 
  ConflictException, 
  NotFoundException, 
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterAgentDto, ApproveAgentDto, UpdateAgentDto } from './dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AgentsService {
  constructor(private prisma: PrismaService) {}

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
    return this.prisma.$transaction(async (tx) => {
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

    if (agent.status !== 'pending' && agent.status !== 'active') {
      throw new BadRequestException(`Agent is already ${agent.status}`);
    }

    return this.prisma.$transaction(async (tx) => {
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
   * Update agent profile
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
        commissionRate: dto.commissionRate,
        maxCashOnHand: dto.maxCashOnHand ? dto.maxCashOnHand : undefined,
        dailyTransactionLimit: dto.dailyTransactionLimit ? dto.dailyTransactionLimit : undefined,
        monthlyTransactionLimit: dto.monthlyTransactionLimit ? dto.monthlyTransactionLimit : undefined,
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
}