import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Req,
  Query,
  BadRequestException,
  ConflictException, // ✅ ADD THIS
  NotFoundException,
  ForbiddenException,
  ParseIntPipe,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
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
  //
  // KYC images are accepted directly in this same multipart request (like
  // auth.controller.ts's own register does for legalFormDocument) rather than
  // via a separate upload step -- every other /agents route requires
  // AgentGuard (status active + kycStatus verified), which a brand-new
  // pending agent can never satisfy, so there is no authenticated route they
  // could use to attach documents afterwards.
  @Public()
  @Post('register')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'idFrontImage', maxCount: 1 },
        { name: 'idBackImage', maxCount: 1 },
        { name: 'selfieImage', maxCount: 1 },
        { name: 'addressProofImage', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            const dir = './uploads/agent_kyc';
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            cb(null, dir);
          },
          filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
          },
        }),
      },
    ),
  )
  async register(
    @Body() dto: RegisterAgentDto,
    @UploadedFiles()
    files: {
      idFrontImage?: Express.Multer.File[];
      idBackImage?: Express.Multer.File[];
      selfieImage?: Express.Multer.File[];
      addressProofImage?: Express.Multer.File[];
    },
  ) {
    try {
      const toPath = (f?: Express.Multer.File[]) =>
        f?.[0] ? `uploads/agent_kyc/${f[0].filename}` : undefined;

      const agent = await this.agentsService.registerAgent({
        ...dto,
        idFrontImage: toPath(files?.idFrontImage),
        idBackImage: toPath(files?.idBackImage),
        selfieImage: toPath(files?.selfieImage),
        addressProofImage: toPath(files?.addressProofImage),
      });
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

  // JwtAuthGuard only, deliberately NOT AgentGuard -- a pending/rejected agent
  // can never satisfy AgentGuard's active+verified check, so this is the only
  // route that lets them see their own KYC status while waiting on approval.
  @Get('my-status')
  @UseGuards(JwtAuthGuard)
  async getMyStatus(@Req() req) {
    try {
      const agent = await this.agentsService.getAgentProfile(req.user.userId);
      return { success: true, data: agent };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { success: true, data: null };
      }
      throw error;
    }
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