// kongossa-backend/src/auth/otp.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OtpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async sendOtp(email: string, purpose: string, userId?: number) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = await bcrypt.hash(code, 10);

    // Save OTP to database (userId is optional)
    await this.prisma.otp.create({
      data: {
        email,
        purpose,
        codeHash,
        userId, // Can be undefined (will be stored as NULL)
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await this.mailService.sendOtpEmail(email, code, purpose);
    
    return { success: true, message: 'OTP sent to email' };
  }

  async verifyOtp(email: string, code: string, purpose: string) {
    const otp = await this.prisma.otp.findFirst({
      where: {
        email,
        purpose,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otp) {
      throw new BadRequestException('OTP not found or expired');
    }

    const isValid = await bcrypt.compare(code, otp.codeHash);
    if (!isValid) {
      throw new BadRequestException('Invalid OTP');
    }

    // Mark as used
    await this.prisma.otp.update({
      where: { id: otp.id },
      data: { used: true },
    });

    return { success: true };
  }
}