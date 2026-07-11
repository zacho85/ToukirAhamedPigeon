import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StripeModule } from '../stripe/stripe.module';
import { MomoModule } from '../momo/momo.module';
import { OrangeMoneyModule } from '../orange-money/orange-money.module';
import { TransfiModule } from '../transfi/transfi.module';
import { MpesaModule } from '../mpesa/mpesa.module'; // ✅ NEW
import { PaymentMethodsService } from './payment-methods.service';
import { PaymentMethodsController } from './payment-methods.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PaystackModule } from '../paystack/paystack.module';
import { FlutterwaveModule } from '../flutterwave/flutterwave.module';
import { AirtelMoneyModule } from '../airtel-money/airtel-money.module';

@Module({
  imports: [
    PrismaModule,
    StripeModule,
    MomoModule,
    OrangeMoneyModule,
    TransfiModule,
    MpesaModule, 
    PaystackModule,
    FlutterwaveModule,
    AirtelMoneyModule,
  ],
  providers: [PaymentMethodsService, PrismaService],
  exports: [PaymentMethodsService],
  controllers: [PaymentMethodsController],
})
export class PaymentMethodsModule {}