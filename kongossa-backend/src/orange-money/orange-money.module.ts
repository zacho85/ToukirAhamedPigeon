import { Module } from '@nestjs/common';
import { OrangeMoneyService } from './orange-money.service';
import { OrangeMoneyController } from './orange-money.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [OrangeMoneyController],
  providers: [OrangeMoneyService],
  exports: [OrangeMoneyService],
})
export class OrangeMoneyModule {}
