import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TransactionHistoryDto } from './dto/transaction-history.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

/**
 * Controller to handle HTTP requests for transactions.
 * Handles routing, validation, and calls the service layer.
 */
@ApiTags('Transactions')
@ApiBearerAuth('bearer')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * Create a new transaction
   */
  @Post()
  async create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }

  @Post('history')
  async history(@Req() req: any, @Body() dto: TransactionHistoryDto) {
    return this.transactionsService.getUserHistory(req.user.userId, dto);
  }

  /**
   * Get all transactions
   */
  @Get()
  async findAll() {
    return this.transactionsService.findAll();
  }

  /**
   * Get a specific transaction by ID
   * @param id - Transaction ID
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.findOne(id);
  }

  /**
   * Update a transaction
   */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<CreateTransactionDto>,
  ) {
    return this.transactionsService.update(id, data);
  }

  /**
   * Delete a transaction
   */
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('send')
  async sendMoney(@Req() req: any, @Body() dto: {
      recipientId: number;
      amount: number;
      paymentMethodId?: number;
      description?: string;
  }) {
      try {
          const result = await this.transactionsService.sendMoney(req.user.userId, {
              recipientId: dto.recipientId,
              amount: dto.amount,
              description: dto.description,
          });
          
          return {
              success: true,
              message: result.message || 'Money sent successfully',
              transaction: result.transaction,
              updatedBalance: result.updatedBalance,
          };
      } catch (error: any) {
          throw new BadRequestException(error.message || 'Failed to send money');
      }
  }

}
