import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { PrismaService } from '../prisma/prisma.service';
import { MailModule } from '../mail/mail.module';  // ✅ Import MailModule

@Module({
  imports: [MailModule],  // ✅ Add this line
  controllers: [OtpController],
  providers: [OtpService, PrismaService],
  exports: [OtpService],
})
export class OtpModule {}