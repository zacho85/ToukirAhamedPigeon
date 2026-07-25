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
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/guards/roles.guard';
import { Roles } from '../roles/decorators/roles.decorator';
import { AgentGuard } from './guards/agent.guard';

@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

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
    const userId = req.user.id;
    const agent = await this.agentsService.getAgentProfile(userId);
    return {
      success: true,
      data: agent,
    };
  }

  @Get('dashboard/stats')
  @UseGuards(JwtAuthGuard, AgentGuard)
  async getDashboardStats(@Req() req) {
    const userId = req.user.id;
    const stats = await this.agentsService.getDashboardStats(userId);
    return {
      success: true,
      data: stats,
    };
  }

  @Get('my-code')
  @UseGuards(JwtAuthGuard, AgentGuard)
  async getAgentCode(@Req() req) {
    const userId = req.user.id;
    const agentCode = await this.agentsService.getAgentCode(userId);
    return {
      success: true,
      data: { agentCode },
    };
  }

  @Get('check')
  @UseGuards(JwtAuthGuard)
  async checkAgentStatus(@Req() req) {
    const userId = req.user.id;
    const isAgent = await this.agentsService.isAgent(userId);
    return {
      success: true,
      data: { isAgent },
    };
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  async getAgentById(@Param('id', ParseIntPipe) id: number) {
    const agent = await this.agentsService.getAgentById(id);
    return {
      success: true,
      data: agent,
    };
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  async approveAgent(
    @Param('id', ParseIntPipe) agentId: number,
    @Body() dto: ApproveAgentDto,
    @Req() req,
  ) {
    const adminUserId = req.user.id;
    const agent = await this.agentsService.approveAgent(agentId, dto, adminUserId);
    return {
      success: true,
      message: `Agent ${dto.status === 'approved' ? 'approved' : 'rejected'} successfully`,
      data: agent,
    };
  }

  @Patch(':id/suspend')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
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
    const userId = req.user.id;
    const agent = await this.agentsService.updateAgentProfile(userId, dto);
    return {
      success: true,
      message: 'Profile updated successfully',
      data: agent,
    };
  }

  @Patch(':id/commission')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
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
}