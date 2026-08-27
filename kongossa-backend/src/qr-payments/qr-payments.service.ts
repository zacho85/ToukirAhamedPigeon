import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQRPaymentDto } from './dto/create-qr-payment.dto';
import { UpdateQRPaymentDto } from './dto/update-qr-payment.dto';

// Only the fields a QR payment's counterpart needs to see -- never the full
// User row (which includes the password hash) via `include`.
const RECIPIENT_SELECT = {
  id: true,
  fullName: true,
  email: true,
  profileImage: true,
} as const;

@Injectable()
export class QRPaymentsService {
  constructor(private prisma: PrismaService) {}

  // recipientId is always the caller -- a QR payment can only ever be created
  // for yourself, never on behalf of an arbitrary other user id.
  async create(recipientId: number, createDto: CreateQRPaymentDto) {
    return this.prisma.qRPayment.create({
      data: { ...createDto, recipientId },
    });
  }

  // Always scoped to the caller's own QR payments -- there is no admin-wide
  // listing permission for this resource, so recipientId is never
  // client-controlled here either.
  async findAllForUser(
    recipientId: number,
    query?: {
      qrCode?: string;
      amount?: number;
      currency?: string;
      description?: string;
      isActive?: boolean;
      expiryDate?: Date;
      usageLimit?: number;
      usageCount?: number;
      paymentType?: string;
    },
  ) {
    const filters: any = { recipientId };

    if (query?.qrCode) filters.qrCode = query.qrCode;
    if (query?.amount) filters.amount = query.amount;
    if (query?.currency) filters.currency = query.currency;
    if (query?.description) filters.description = query.description;
    if (query?.isActive !== undefined) filters.isActive = query.isActive;
    if (query?.expiryDate) filters.expiryDate = query.expiryDate;
    if (query?.usageLimit) filters.usageLimit = query.usageLimit;
    if (query?.usageCount) filters.usageCount = query.usageCount;
    if (query?.paymentType) filters.paymentType = query.paymentType;

    return this.prisma.qRPayment.findMany({
      where: filters,
      include: { recipient: { select: RECIPIENT_SELECT } },
    });
  }

  // Used by the public/authenticated payer flow (payQRPayment) where any user
  // needs to read someone else's QR payment to pay it -- ownership is
  // enforced separately in the controller for the owner-only routes.
  async findOne(id: number) {
    const qr = await this.prisma.qRPayment.findUnique({
      where: { id },
      include: { recipient: { select: RECIPIENT_SELECT } },
    });
    if (!qr) throw new NotFoundException('QR Payment not found');
    return qr;
  }

  async findOwned(id: number, recipientId: number) {
    const qr = await this.findOne(id);
    if (qr.recipientId !== recipientId) {
      throw new ForbiddenException('This QR payment does not belong to you');
    }
    return qr;
  }

  async update(id: number, recipientId: number, updateDto: UpdateQRPaymentDto) {
    await this.findOwned(id, recipientId);
    return this.prisma.qRPayment.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: number, recipientId: number) {
    await this.findOwned(id, recipientId);
    return this.prisma.qRPayment.delete({ where: { id } });
  }
}
