import { Module } from '@nestjs/common';
import { PaystackService } from './paystack.service';
import { PaystackController } from './paystack.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [PaystackService, PrismaService, ConfigService],
  controllers: [PaystackController],
  exports: [PaystackService],
})
export class PaystackModule {}