// transactions.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionHistoryDto } from './dto/transaction-history.dto';
import { randomUUID } from 'crypto';
import crypto from 'crypto';
import { WalletTopUpService } from '../wallet-topup/wallet-topup.service';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private walletService: WalletTopUpService, // Inject wallet service for balance calculations
  ) {}

  async create(createTransactionDto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        ...createTransactionDto,
        transactionId: `TX-${randomUUID()}`,
      },
    });
  }

  async getUserHistory(userId: number, dto: TransactionHistoryDto) {
    const { type, status, search, fromDate, toDate, page = 1, limit = 20 } = dto;

    const where: any = {
      OR: [{ senderId: userId }, { recipientId: userId }],
    };

    if (type && type !== 'all') {
      if (type === 'deposit') {
        where.type = { in: ['wallet_topup', 'deposit'] };
      } else {
        where.type = type;
      }
    }

    if (status && status !== 'all') where.status = status;

    if (search) {
      where.OR.push({ description: { contains: search, mode: 'insensitive' } });
    }

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAll() {
    return this.prisma.transaction.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: number) {
    const transaction = await this.prisma.transaction.findUnique({ where: { id } });
    if (!transaction) throw new NotFoundException(`Transaction with ID ${id} not found`);
    return transaction;
  }

  async update(id: number, data: Partial<CreateTransactionDto>) {
    const transaction = await this.prisma.transaction.findUnique({ where: { id } });
    if (!transaction) throw new NotFoundException(`Transaction with ID ${id} not found`);
    return this.prisma.transaction.update({ where: { id }, data });
  }

  async remove(id: number) {
    const transaction = await this.prisma.transaction.findUnique({ where: { id } });
    if (!transaction) throw new NotFoundException(`Transaction with ID ${id} not found`);
    return this.prisma.transaction.delete({ where: { id } });
  }

  /**
   * Send money between users
   * Balance is always recalculated from transactions table
   */
  // transactions.service.ts
  async sendMoney(
    senderId: number,
    dto: { recipientId: number; amount: number; description?: string },
  ) {
    const sender = await this.prisma.user.findUnique({ where: { id: senderId } });
    if (!sender) throw new NotFoundException('Sender not found');

    const recipient = await this.prisma.user.findUnique({ where: { id: dto.recipientId } });
    if (!recipient) throw new NotFoundException('Recipient not found');

    const settings = await this.prisma.systemSettings.findFirst();
    if (!settings) throw new BadRequestException('System settings not configured');

    const transferFee = dto.amount * (settings.transferFeePercent / 100);
    const totalDeduction = dto.amount + transferFee;

    const senderCurrentBalance = sender.walletBalance;

    console.log('Sender balance:', senderCurrentBalance);
    console.log('Transfer amount:', dto.amount);
    console.log('Transfer fee:', transferFee);

    if (senderCurrentBalance < totalDeduction) {
      throw new BadRequestException('Insufficient balance');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1️⃣ Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          transactionId: crypto.randomUUID(),
          senderId,
          recipientId: dto.recipientId,
          amount: dto.amount,
          fee: transferFee,
          type: 'wallet_transfer',
          status: 'completed',
          description: dto.description || 'Wallet transfer',
        },
      });

      // 2️⃣ Update sender's balance (decrease)
      const updatedSender = await tx.user.update({
        where: { id: senderId },
        data: { walletBalance: { decrement: totalDeduction } },
      });

      // 3️⃣ Update recipient's balance (increase)
      await tx.user.update({
        where: { id: dto.recipientId },
        data: { walletBalance: { increment: dto.amount } },
      });

      console.log(`Sender ${senderId}: -${totalDeduction}`);
      console.log(`Recipient ${dto.recipientId}: +${dto.amount}`);

      // ✅ Return transaction with updated sender balance
      return {
        success: true,
        message: 'Money sent successfully',
        transaction: {
          id: transaction.id,
          transactionId: transaction.transactionId,
          amount: transaction.amount,
          fee: transaction.fee,
          type: transaction.type,
          status: transaction.status,
          description: transaction.description,
          createdAt: transaction.createdAt,
        },
        updatedBalance: updatedSender.walletBalance,
      };
    });
  }
  async processQRPayment(senderId: number, qrPaymentId: number, customAmount?: number) {
    const qrPayment = await this.prisma.qRPayment.findUnique({
      where: { id: qrPaymentId },
      include: { recipient: true },
    });

    if (!qrPayment) throw new NotFoundException('QR payment not found');
    if (!qrPayment.isActive) throw new BadRequestException('QR payment is inactive');
    if (qrPayment.expiryDate && new Date() > qrPayment.expiryDate) {
      throw new BadRequestException('QR payment has expired');
    }

    const amount = customAmount || qrPayment.amount;
    if (!amount) throw new BadRequestException('Amount is required');

    // Get sender to check balance
    const sender = await this.prisma.user.findUnique({ where: { id: senderId } });
    if (!sender) throw new NotFoundException('Sender not found');

    const settings = await this.prisma.systemSettings.findFirst();
    if (!settings) throw new BadRequestException('System settings not configured');

    const transferFee = amount * (settings.transferFeePercent / 100);
    const totalDeduction = amount + transferFee;

    if (sender.walletBalance < totalDeduction) {
      throw new BadRequestException('Insufficient balance');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1️⃣ Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          transactionId: crypto.randomUUID(),
          senderId,
          recipientId: qrPayment.recipientId,
          amount: amount,
          fee: transferFee,
          type: 'wallet_transfer',
          status: 'completed',
          description: qrPayment.description || 'QR code payment',
        },
      });

      // 2️⃣ Update sender's balance (decrease)
      const updatedSender = await tx.user.update({
        where: { id: senderId },
        data: { walletBalance: { decrement: totalDeduction } },
      });

      // 3️⃣ Update recipient's balance (increase)
      await tx.user.update({
        where: { id: qrPayment.recipientId },
        data: { walletBalance: { increment: amount } },
      });

      // 4️⃣ Update QR payment usage count
      await tx.qRPayment.update({
        where: { id: qrPaymentId },
        data: { usageCount: { increment: 1 } },
      });

      console.log(`QR Payment: Sender ${senderId}: -${totalDeduction}, Recipient ${qrPayment.recipientId}: +${amount}`);

      // 5️⃣ Return with updated balance
      return {
        success: true,
        message: 'QR payment completed successfully',
        transaction: {
          id: transaction.id,
          transactionId: transaction.transactionId,
          amount: transaction.amount,
          fee: transaction.fee,
          type: transaction.type,
          status: transaction.status,
          description: transaction.description,
          createdAt: transaction.createdAt,
        },
        updatedBalance: updatedSender.walletBalance,
      };
    });
  }
}
