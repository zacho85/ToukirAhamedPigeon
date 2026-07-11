import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { MomoService } from '../momo/momo.service';
import { OrangeMoneyService } from '../orange-money/orange-money.service';
import { TransfiService } from '../transfi/transfi.service';
import { MpesaService } from '../mpesa/mpesa.service'; // ✅ NEW
import { AirtelMoneyService } from '../airtel-money/airtel-money.service';

@Injectable()
export class PaymentMethodsService {
  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
    private momoService: MomoService,
    private orangeMoneyService: OrangeMoneyService,
    private transfiService: TransfiService,
    private mpesaService: MpesaService, // ✅ NEW
    private airtelMoneyService: AirtelMoneyService,
  ) {}

  // -----------------------------------
  // Ensure Stripe Customer
  // -----------------------------------
  async getOrCreateCustomer(userId: number) {
    if (!userId) {
      throw new Error('userId is required');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }

    let customerId = user.stripeId;

    if (customerId) {
      try {
        await this.stripeService.client.customers.retrieve(customerId);
        return customerId;
      } catch {
        customerId = null;
      }
    }

    const customer = await this.stripeService.client.customers.create({
      email: user.email ?? undefined,
      name: user.fullName ?? undefined,
      metadata: {
        userId: String(user.id),
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { stripeId: customer.id },
    });

    return customer.id;
  }

  // -----------------------------------
  // Create SetupIntent
  // -----------------------------------
  async createSetupIntent(userId: number) {
    try {
      const customerId = await this.getOrCreateCustomer(userId);
      console.log(`Creating SetupIntent for customer: ${customerId}`);

      const setupIntent = await this.stripeService.client.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card'],
        usage: 'off_session',
      });

      console.log(`SetupIntent created: ${setupIntent.id}`);

      return {
        clientSecret: setupIntent.client_secret,
        setupIntentId: setupIntent.id,
      };
    } catch (error: any) {
      console.error('Error creating setup intent:', error);
      throw new BadRequestException(error.message || 'Failed to create setup intent');
    }
  }

  // -----------------------------------
  // Attach & Save Payment Method
  // -----------------------------------
  async attachPaymentMethod(
    userId: number,
    paymentMethodId: string,
    meta?: {
      accountName?: string;
      bankName?: string;
    },
  ) {
    const customerId = await this.getOrCreateCustomer(userId);

    const pm = await this.stripeService.client.paymentMethods.attach(
      paymentMethodId,
      { customer: customerId },
    );

    const card = pm.card!;
    const expiryDate = `${card.exp_month}/${card.exp_year}`;

    return this.prisma.paymentMethod.create({
      data: {
        userId,
        type: 'card',
        provider: 'stripe',
        accountName: meta?.accountName ?? null,
        bankName: meta?.bankName ?? null,
        accountNumber: `**** **** **** ${card.last4}`,
        expiryDate,
        stripePmId: pm.id,
        stripeCustomer: customerId,
        brand: card.brand,
        lastFour: card.last4,
        expiryMonth: card.exp_month,
        expiryYear: card.exp_year,
        isVerified: true,
      },
    });
  }

  // -----------------------------------
  // Add MTN MoMo Wallet
  // -----------------------------------
  async addMomoWallet(
    userId: number,
    data: {
      accountName: string;
      phoneNumber: string;
      countryCode: string;
    },
  ) {
    const currency = this.momoService.getCurrencyFromCountry(data.countryCode);

    return this.prisma.paymentMethod.create({
      data: {
        userId,
        type: 'mobile_money',
        provider: 'mtn_momo',
        accountName: data.accountName,
        phoneNumber: data.phoneNumber,
        countryCode: data.countryCode.toUpperCase(),
        momoProvider: 'mtn',
        currency,
        isVerified: false,
      },
    });
  }

  // -----------------------------------
  // Add Orange Money Wallet
  // -----------------------------------
  async addOrangeMoneyWallet(
    userId: number,
    data: {
      accountName: string;
      phoneNumber: string;
      countryCode: string;
    },
  ) {
    const currency = this.orangeMoneyService.getCurrencyFromCountry(data.countryCode);

    return this.prisma.paymentMethod.create({
      data: {
        userId,
        type: 'mobile_money',
        provider: 'orange_money',
        accountName: data.accountName,
        phoneNumber: data.phoneNumber,
        countryCode: data.countryCode.toUpperCase(),
        momoProvider: 'orange',
        currency,
        isVerified: false,
      },
    });
  }

  // -----------------------------------
  // Add Transfi Wallet (Zamtel)
  // -----------------------------------
  async addTransfiWallet(
    userId: number,
    data: {
      accountName: string;
      phoneNumber: string;
      countryCode: string;
    },
  ) {
    return this.prisma.paymentMethod.create({
      data: {
        userId,
        type: 'mobile_money',
        provider: 'transfi_zamtel',
        accountName: data.accountName,
        phoneNumber: data.phoneNumber,
        countryCode: 'ZM',
        momoProvider: 'zamtel',
        currency: 'ZMW',
        isVerified: false,
      },
    });
  }

  // -----------------------------------
  // Add M-Pesa Wallet (NEW)
  // -----------------------------------
  async addMpesaWallet(
    userId: number,
    data: {
      accountName: string;
      phoneNumber: string;
      countryCode: string;
    },
  ) {
    const currency = this.mpesaService.getCurrencyFromCountry(data.countryCode);

    return this.prisma.paymentMethod.create({
      data: {
        userId,
        type: 'mobile_money',
        provider: 'mpesa',
        accountName: data.accountName,
        phoneNumber: data.phoneNumber,
        countryCode: data.countryCode.toUpperCase(),
        momoProvider: 'mpesa',
        currency,
        isVerified: false,
      },
    });
  }

  // -----------------------------------
  // List Payment Methods
  // -----------------------------------
  async list(userId: number) {
    try {
      return this.prisma.paymentMethod.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      console.error('Error listing payment methods:', error);
      throw new Error('Failed to list payment methods');
    }
  }

  // -----------------------------------
  // Delete Payment Method
  // -----------------------------------
  async remove(userId: number, id: number) {
    const pm = await this.prisma.paymentMethod.findFirst({
      where: { id, userId },
    });

    if (!pm) throw new BadRequestException('Payment method not found');

    if (pm.stripePmId) {
      try {
        await this.stripeService.client.paymentMethods.detach(pm.stripePmId);
      } catch (error: any) {
        console.log(`Payment method ${pm.stripePmId} not found in Stripe, skipping detach:`, error.message);
      }
    }

    return this.prisma.paymentMethod.delete({ where: { id } });
  }

  async addPaystackWallet(
    userId: number,
    data: { accountName: string; countryCode?: string },
  ) {
    return this.prisma.paymentMethod.create({
      data: {
        userId,
        type: 'payment_gateway',
        provider: 'paystack',
        accountName: data.accountName,
        countryCode: data.countryCode || 'NG',
        isVerified: false,
      },
    });
  }

  async addFlutterwaveWallet(
    userId: number,
    data: { accountName: string; countryCode?: string },
  ) {
    return this.prisma.paymentMethod.create({
      data: {
        userId,
        type: 'payment_gateway',
        provider: 'flutterwave',
        accountName: data.accountName,
        countryCode: data.countryCode || 'NG',
        isVerified: false,
      },
    });
  }

  async addAirtelMoneyWallet(
    userId: number,
    data: {
      accountName: string;
      phoneNumber: string;
      countryCode: string;
    },
  ) {
    const currency = this.airtelMoneyService.getCurrencyFromCountry(data.countryCode);

    return this.prisma.paymentMethod.create({
      data: {
        userId,
        type: 'mobile_money',
        provider: 'airtel_money',
        accountName: data.accountName,
        phoneNumber: data.phoneNumber,
        countryCode: data.countryCode.toUpperCase(),
        momoProvider: 'airtel',
        currency,
        isVerified: false,
      },
    });
  }
}