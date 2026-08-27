import { Controller, Get, Post, Body, Param, Patch, ParseIntPipe, Query, Req, UseGuards } from '@nestjs/common';
import { FloatRequestsService } from './float-requests.service';
import { CreateFloatRequestDto } from './dto/create-float-request.dto';
import { ReviewFloatRequestDto } from './dto/review-float-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { AgentGuard } from '../agents/guards/agent.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Float Requests')
@ApiBearerAuth('bearer')
@Controller('float-requests')
export class FloatRequestsController {
  constructor(private readonly service: FloatRequestsService) {}

  // Agent's own requests -----------------------------------------------
  @Post()
  @UseGuards(JwtAuthGuard, AgentGuard)
  create(@Req() req: any, @Body() dto: CreateFloatRequestDto) {
    return this.service.createForAgent(req.user.userId, dto);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard, AgentGuard)
  findMine(@Req() req: any, @Query('status') status?: string) {
    return this.service.findAllForAgent(req.user.userId, status);
  }

  // Admin review ---------------------------------------------------------
  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('read:agent-crm')
  findAll(@Query('agentId') agentId?: string, @Query('status') status?: string) {
    return this.service.findAll({
      agentId: agentId ? Number(agentId) : undefined,
      status,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('read:agent-crm')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id/review')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('update:agent-crm')
  review(@Param('id', ParseIntPipe) id: number, @Body() dto: ReviewFloatRequestDto) {
    return this.service.review(id, dto);
  }
}
