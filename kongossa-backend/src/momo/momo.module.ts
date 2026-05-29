import { Module } from '@nestjs/common';
import { MomoService } from './momo.service';
import { MomoController } from './momo.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [MomoController],
  providers: [MomoService],
  exports: [MomoService],
})
export class MomoModule {}
