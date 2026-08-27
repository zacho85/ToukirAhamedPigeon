import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
  BadRequestException,
  ConflictException, // ✅ ADD THIS
  NotFoundException,
  ForbiddenException,
  ParseIntPipe,
} from '@nestjs/common';
import { AgentsService } from './agents.service';
import {
  RegisterAgentDto,
  ApproveAgentDto,
  UpdateAgentDto,
  CashTransactionDto,
  ConfirmCashOutDto,
  StartDayDto,
  EndDayDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { AgentGuard } from './guards/agent.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Agents')
@ApiBearerAuth('bearer')
@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  // PUBLIC: creates a brand-new user account + agent profile, so the caller
  // cannot already be authenticated. Approval is a separate admin step.
  @Public()
  @Post('register')
  async register(@Body() dto: RegisterAgentDto) {
    try {
      const agent = await this.agentsService.registerAgent(dto);
      return {
        success: true,
        message: 'Agent registration submitted for approval',
        data: {
          id: agent.id,
          agentCode: agent.agentCode,
          status: agent.status,
          kycStatus: agent.kycStatus,
          user: agent.user,
        },
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard, AgentGuard)
  async getProfile(@Req() req) {
    const userId = req.user.userId;
    const agent = await this.agentsService.getAgentProfile(userId);
    return {
      success: true,
      data: agent,
    };
  }

  @Get('dashboard/stats')
  @UseGuards(JwtAuthGuard, AgentGuard)
  async getDashboardStats(@Req() req) {
    const userId = req.user.userId;
    const stats = await this.agentsService.getDashboardStats(userId);
    return {
      success: true,
      data: stats,
    };
  }

  @Get('my-code')
  @UseGuards(JwtAuthGuard, AgentGuard)
  async getAgentCode(@Req() req) {
    const userId = req.user.userId;
    const agentCode = await this.agentsService.getAgentCode(userId);
    return {
      success: true,
      data: { agentCode },
    };
  }

  @Get('check')
  @UseGuards(JwtAuthGuard)
  async checkAgentStatus(@Req() req) {
    const userId = req.user.userId;
    const isAgent = await this.agentsService.isAgent(userId);
    return {
      success: true,
      data: { isAgent },
    };
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('read:agent-crm')
  async getAllAgents(
    @Query('status') status?: string,
    @Query('kycStatus') kycStatus?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const result = await this.agentsService.getAllAgents({
      status,
      kycStatus,
      search,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
    });
    return {
      success: true,
      ...result,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('read:agent-crm')
  async getAgentById(@Param('id', ParseIntPipe) id: number) {
    const agent = await this.agentsService.getAgentById(id);
    return {
      success: true,
      data: agent,
    };
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('update:agent-crm')
  async approveAgent(
    @Param('id', ParseIntPipe) agentId: number,
    @Body() dto: ApproveAgentDto,
    @Req() req,
  ) {
    const adminUserId = req.user.userId;
    const agent = await this.agentsService.approveAgent(agentId, dto, adminUserId);
    return {
      success: true,
      message: `Agent ${dto.status === 'approved' ? 'approved' : 'rejected'} successfully`,
      data: agent,
    };
  }

  @Patch(':id/suspend')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('update:agent-crm')
  async suspendAgent(
    @Param('id', ParseIntPipe) agentId: number,
    @Body('reason') reason?: string,
  ) {
    const agent = await this.agentsService.suspendAgent(agentId, reason);
    return {
      success: true,
      message: 'Agent suspended successfully',
      data: agent,
    };
  }

  @Patch(':id/activate')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('update:agent-crm')
  async activateAgent(@Param('id', ParseIntPipe) agentId: number) {
    const agent = await this.agentsService.activateAgent(agentId);
    return {
      success: true,
      message: 'Agent activated successfully',
      data: agent,
    };
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard, AgentGuard)
  async updateProfile(@Req() req, @Body() dto: UpdateAgentDto) {
    const userId = req.user.userId;
    const agent = await this.agentsService.updateAgentProfile(userId, dto);
    return {
      success: true,
      message: 'Profile updated successfully',
      data: agent,
    };
  }

  @Patch(':id/commission')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('update:agent-crm')
  async updateCommission(
    @Param('id', ParseIntPipe) agentId: number,
    @Body('commissionRate') commissionRate: number,
  ) {
    const agent = await this.agentsService.updateAgentProfile(agentId, { commissionRate });
    return {
      success: true,
      message: 'Commission rate updated successfully',
      data: agent,
    };
  }

  // -------------------------------------------------------------------
  // Cash In / Cash Out
  // -------------------------------------------------------------------

  @Post('cash-in')
  @UseGuards(JwtAuthGuard, AgentGuard)
  async cashIn(@Req() req, @Body() dto: CashTransactionDto) {
    const transaction = await this.agentsService.processCashIn(req.agent, dto);
    return { success: true, data: transaction };
  }

  @Post('cash-out')
  @UseGuards(JwtAuthGuard, AgentGuard)
  async cashOut(@Req() req, @Body() dto: CashTransactionDto) {
    const transaction = await this.agentsService.processCashOut(req.agent, dto);
    return { success: true, data: transaction };
  }

  @Post('cash-out/:id/confirm')
  @UseGuards(JwtAuthGuard, AgentGuard)
  async confirmCashOut(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ConfirmCashOutDto,
  ) {
    const transaction = await this.agentsService.confirmCashOut(req.agent, id, dto);
    return { success: true, data: transaction };
  }

  @Get('transactions/mine')
  @UseGuards(JwtAuthGuard, AgentGuard)
  async myTransactions(@Req() req) {
    const data = await this.agentsService.getOwnCashTransactions(req.agent.id);
    return { success: true, data };
  }

  // -------------------------------------------------------------------
  // Day settlement
  // -------------------------------------------------------------------

  @Post('day/start')
  @UseGuards(JwtAuthGuard, AgentGuard)
  async startDay(@Req() req, @Body() dto: StartDayDto) {
    const settlement = await this.agentsService.startDay(req.agent, dto);
    return { success: true, data: settlement };
  }

  @Post('day/end')
  @UseGuards(JwtAuthGuard, AgentGuard)
  async endDay(@Req() req, @Body() dto: EndDayDto) {
    const settlement = await this.agentsService.endDay(req.agent, dto);
    return { success: true, data: settlement };
  }

  @Get('day/current')
  @UseGuards(JwtAuthGuard, AgentGuard)
  async currentDay(@Req() req) {
    const settlement = await this.agentsService.getCurrentDaySettlement(req.agent.id);
    return { success: true, data: settlement };
  }

  @Get('day/history')
  @UseGuards(JwtAuthGuard, AgentGuard)
  async dayHistory(@Req() req) {
    const data = await this.agentsService.getDaySettlements(req.agent.id);
    return { success: true, data };
  }
}