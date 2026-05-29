import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StripeModule } from '../stripe/stripe.module';
import { MomoModule } from '../momo/momo.module';
import { OrangeMoneyModule } from '../orange-money/orange-money.module';
import { TransfiModule } from '../transfi/transfi.module';
import { PaymentMethodsService } from './payment-methods.service';
import { PaymentMethodsController } from './payment-methods.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [PrismaModule, StripeModule, MomoModule, OrangeMoneyModule, TransfiModule],
  providers: [PaymentMethodsService, PrismaService],
  exports: [PaymentMethodsService],
  controllers: [PaymentMethodsController],
})
export class PaymentMethodsModule {}