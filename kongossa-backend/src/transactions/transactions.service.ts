// transactions.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionHistoryDto } from './dto/transaction-history.dto';
import { randomUUID } from 'crypto';
import crypto from 'crypto';
import { WalletTopUpService } from '../wallet-topup/wallet-topup.service';
import { FeesService } from '../fees/fees.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private walletService: WalletTopUpService, // Inject wallet service for balance calculations
    private fees: FeesService,
    private mail: MailService,
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

    // Enhanced type filtering
    if (type && type !== 'all') {
      switch (type) {
        case 'topup':
          where.type = { in: ['wallet_topup', 'deposit'] };
          break;
        case 'withdrawal':
          where.type = { in: ['wallet_payout', 'withdrawal'] };
          break;
        case 'received':
          where.recipientId = userId;
          where.type = { in: ['wallet_transfer', 'payment_link'] };
          break;
        case 'sent':
          where.senderId = userId;
          where.type = { in: ['wallet_transfer', 'payment_link'] };
          break;
        default:
          if (type !== 'all') where.type = type;
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

    // Get transactions with user names
    const [data, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          sender: { select: { fullName: true, id: true } },
          recipient: { select: { fullName: true, id: true } },
        },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    // Transform data to include names
    const transformedData = data.map(transaction => ({
      ...transaction,
      amount: Number(transaction.amount),
      fee: Number(transaction.fee),
      senderName: transaction.sender?.fullName,
      recipientName: transaction.recipient?.fullName,
    }));

    return {
      data: transformedData,
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
    if (!recipient || recipient.status !== 'active') throw new NotFoundException('Recipient not found');
    if (recipient.id === senderId) throw new BadRequestException('You cannot send money to yourself');

    // Free up to the daily amount, then the platform's transfer fee on top.
    const amount = Math.round(dto.amount * 100) / 100;
    const { fee: transferFee } = await this.fees.transferFee(senderId, amount);
    const totalDeduction = Math.round((amount + transferFee) * 100) / 100;

    const senderCurrentBalance = sender.walletBalance;

    console.log('Sender balance:', senderCurrentBalance);
    console.log('Transfer amount:', dto.amount);
    console.log('Transfer fee:', transferFee);

    if (senderCurrentBalance < totalDeduction) {
      throw new BadRequestException('Insufficient balance');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // 1️⃣ Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          transactionId: crypto.randomUUID(),
          senderId,
          recipientId: dto.recipientId,
          amount,
          fee: transferFee,
          type: 'wallet_transfer',
          status: 'completed',
          paymentMethod: 'send_money',
          description: dto.description || 'Wallet transfer',
        },
      });

      // 2️⃣ Debit the sender (amount + fee) only if the balance still covers it
      const debited = await tx.user.updateMany({
        where: { id: senderId, walletBalance: { gte: totalDeduction } },
        data: { walletBalance: { decrement: totalDeduction } },
      });
      if (debited.count === 0) throw new BadRequestException('Insufficient balance');
      const updatedSender = await tx.user.findUniqueOrThrow({ where: { id: senderId } });

      // 3️⃣ Update recipient's balance (increase)
      await tx.user.update({
        where: { id: dto.recipientId },
        data: { walletBalance: { increment: amount } },
      });

      // 4️⃣ The fee goes to the platform account, with its own ledger row
      await this.fees.recordFee(tx, {
        payerId: senderId,
        fee: transferFee,
        reference: transaction.transactionId,
        description: 'Transfer fee',
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

    // Receipts after the money has moved; a mail failure never undoes the transfer.
    const date = `${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`;
    const money = (v: number) => `$${Number(v).toFixed(2)}`;
    const reference = result.transaction.transactionId;
    await this.sendReceiptSafely(sender.email, 'Transfer receipt', [
      ['Amount sent', money(amount)],
      ['Fee', money(transferFee)],
      ['Total from your wallet', money(totalDeduction)],
      ['To', recipient.fullName || recipient.email],
      ['Reference', reference],
      ['Date', date],
    ]);
    await this.sendReceiptSafely(recipient.email, 'Money received', [
      ['Amount received', money(amount)],
      ['From', sender.fullName || sender.email],
      ['Reference', reference],
      ['Date', date],
    ]);

    return result;
  }

  private async sendReceiptSafely(to: string, title: string, lines: [string, string][]) {
    try {
      await this.mail.sendReceiptEmail(to, title, lines);
    } catch (error) {
      console.error('Failed to send receipt email:', error.message);
    }
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
