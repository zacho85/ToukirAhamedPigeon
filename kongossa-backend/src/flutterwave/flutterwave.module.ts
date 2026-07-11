import { Module } from '@nestjs/common';
import { FlutterwaveService } from './flutterwave.service';
import { FlutterwaveController } from './flutterwave.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [FlutterwaveService, PrismaService, ConfigService],
  controllers: [FlutterwaveController],
  exports: [FlutterwaveService],
})
export class FlutterwaveModule {}