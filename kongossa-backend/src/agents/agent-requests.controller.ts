import { Body, Controller, Get, Param, ParseIntPipe, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AgentsService } from './agents.service';
import { ConfirmCashOutDto, CustomerCashOutDto } from './dto';

/**
 * The customer's side of agent money movements, used from their own app:
 * start a cash-out at an agent, enter the OTP for a cash-out or an
 * agent-assisted transfer, cancel, and follow the status. Every route acts
 * only on the signed-in customer's own requests (global JwtAuthGuard).
 */
@ApiTags('Agent requests (customer)')
@ApiBearerAuth('bearer')
@Controller('agent-requests')
export class AgentRequestsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get()
  async list(@Req() req) {
    const data = await this.agentsService.getCustomerRequests(req.user.userId);
    return { success: true, data };
  }

  @Post('cash-out')
  async startCashOut(@Req() req, @Body() dto: CustomerCashOutDto) {
    const data = await this.agentsService.createCustomerCashOut(req.user.userId, dto);
    return { success: true, data };
  }

  @Get(':id')
  async get(@Req() req, @Param('id', ParseIntPipe) id: number) {
    const data = await this.agentsService.getCustomerRequest(req.user.userId, id);
    return { success: true, data };
  }

  @Post(':id/confirm')
  async confirm(@Req() req, @Param('id', ParseIntPipe) id: number, @Body() dto: ConfirmCashOutDto) {
    const data = await this.agentsService.confirmCustomerRequest(req.user.userId, id, dto.code);
    return { success: true, data };
  }

  @Post(':id/cancel')
  async cancel(@Req() req, @Param('id', ParseIntPipe) id: number) {
    const data = await this.agentsService.cancelCustomerRequest(req.user.userId, id);
    return { success: true, data };
  }
}
