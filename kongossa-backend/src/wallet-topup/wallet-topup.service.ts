// wallet-topup.service.ts
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { MomoService } from '../momo/momo.service';
import { OrangeMoneyService } from '../orange-money/orange-money.service';
import { ExchangeRateService } from '../exchange-rate/exchange-rate.service';
import { randomUUID } from 'crypto';
import { toNumber } from 'src/common/utils/decimal.util';
import { PaymentMethodsService } from 'src/payment-methods/payment-methods.service';
import { TransfiService } from '../transfi/transfi.service';

@Injectable()
export class WalletTopUpService {
  private readonly logger = new Logger(WalletTopUpService.name);

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private stripe: StripeService,
    private momoService: MomoService,
    private orangeMoneyService: OrangeMoneyService,
    private exchangeRateService: ExchangeRateService,
    private paymentMethods: PaymentMethodsService,
    private transfiService: TransfiService,
  ) {}

  /**
   * Create a Stripe topup intent
   */
  async createTopUpIntent(
    userId: number,
    amount: number,
    paymentMethodId: string,
    remarks?: string,
  ) {
    console.log('💰 createTopUpIntent called');
    console.log('👤 User ID:', userId);
    console.log('💵 Amount:', amount);
    console.log('💳 Payment Method ID:', paymentMethodId);
    console.log('📝 Remarks:', remarks);

    if (amount <= 0) {
      console.error('❌ Invalid amount:', amount);
      throw new BadRequestException('Invalid amount');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.error('❌ User not found:', userId);
      throw new BadRequestException('User not found');
    }

    console.log('👤 User found:', user.email);

    // ✅ Always ensure customer exists in CURRENT Stripe account
    const customerId = await this.paymentMethods.getOrCreateCustomer(userId);
    console.log('🏦 Customer ID:', customerId);

    const intent = await this.stripe.client.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: user.currency.toLowerCase(),
      customer: customerId,
      payment_method: paymentMethodId,
      confirm: false,
      metadata: {
        wallet_topup_user_id: String(userId),
        purpose: 'wallet_topup',
        remarks: remarks || '',
      },
    });

    console.log('✅ Stripe PaymentIntent created:', intent.id);

    await this.prisma.walletTopUp.create({
      data: {
        userId,
        amount,
        currency: user.currency,
        stripeIntentId: intent.id,
        paymentMethodId,
        status: 'pending',
      },
    });

    console.log('📝 WalletTopUp record created');

    return {
      clientSecret: intent.client_secret,
    };
  }

  // -----------------------------------
  // MTN MoMo Top-Up
  // -----------------------------------
  async createMoMoTopUp(
    userId: number,
    amount: number,
    paymentMethodId: number,
  ) {
    console.log('💰 createMoMoTopUp called');
    console.log('👤 User ID:', userId);
    console.log('💵 Amount:', amount);
    console.log('💳 Payment Method ID:', paymentMethodId);

    if (amount <= 0) {
      console.error('❌ Invalid amount:', amount);
      throw new BadRequestException('Invalid amount');
    }

    const paymentMethod = await this.prisma.paymentMethod.findFirst({
      where: { id: paymentMethodId, userId },
    });

    if (!paymentMethod || paymentMethod.provider !== 'mtn_momo') {
      console.error('❌ Invalid MTN MoMo payment method');
      throw new BadRequestException('Invalid MTN MoMo payment method');
    }

    if (!paymentMethod.phoneNumber || !paymentMethod.countryCode) {
      console.error('❌ MoMo payment method incomplete');
      throw new BadRequestException('MoMo payment method incomplete');
    }

    const currency = this.momoService.getCurrencyFromCountry(paymentMethod.countryCode);
    console.log('🌍 Currency from country:', currency);

    try {
      const externalId = `topup_${userId}_${Date.now()}`;
      console.log('📦 External ID:', externalId);

      const { referenceId } = await this.momoService.requestToPay({
        amount,
        currency,
        phoneNumber: paymentMethod.phoneNumber,
        externalId,
        payerMessage: 'Top up your KongossaPay wallet',
        payeeNote: `Wallet top-up: ${amount} ${currency}`,
      });

      console.log('✅ MoMo payment request sent, referenceId:', referenceId);

      const topup = await this.prisma.walletTopUp.create({
        data: {
          userId,
          amount,
          currency: paymentMethod.currency || 'USD',
          stripeIntentId: referenceId,
          paymentMethodId: String(paymentMethodId),
          status: 'pending',
        },
      });

      console.log('📝 WalletTopUp record created for MoMo, id:', topup.id);

      return {
        topupId: topup.id,
        referenceId,
        message: 'Payment request sent to your phone. Please approve.',
      };
    } catch (error: any) {
      console.error('🔥 MoMo payment initiation failed:', error);
      this.logger.error('MoMo payment initiation failed', error);
      throw new BadRequestException(
        `Failed to initiate MoMo payment: ${error.message}`,
      );
    }
  }

  async checkMoMoTopUpStatus(topUpId: number) {
    console.log('🔍 checkMoMoTopUpStatus called for topUpId:', topUpId);

    const topup = await this.prisma.walletTopUp.findUnique({
      where: { id: topUpId },
    });

    if (!topup) {
      console.error('❌ Top-up record not found:', topUpId);
      throw new BadRequestException('Top-up record not found');
    }

    if (!topup.stripeIntentId) {
      console.error('❌ No MoMo reference ID found');
      throw new BadRequestException('No MoMo reference ID found');
    }

    console.log('📦 Checking status for referenceId:', topup.stripeIntentId);

    const status = await this.momoService.getTransactionStatus(
      topup.stripeIntentId,
    );

    console.log('📊 MoMo transaction status:', status.status);

    if (status.status === 'SUCCESSFUL') {
      console.log('✅ Transaction successful, converting currency...');
      
      const exchangeResult = await this.exchangeRateService.convert(
        topup.amount,
        topup.currency,
        'USD',
      );
      const amountInUSD = exchangeResult.convertedAmount;
      console.log('💰 Converted amount:', topup.amount, topup.currency, '→', amountInUSD, 'USD');

      await this.prisma.$transaction([
        this.prisma.walletTopUp.update({
          where: { id: topup.id },
          data: { status: 'succeeded' },
        }),
        this.prisma.user.update({
          where: { id: topup.userId },
          data: { walletBalance: { increment: amountInUSD } },
        }),
        this.prisma.transaction.upsert({
          where: { transactionId: topup.stripeIntentId },
          update: { status: 'completed' },
          create: {
            transactionId: topup.stripeIntentId,
            senderId: topup.userId,
            amount: amountInUSD,
            currency: 'USD',
            type: 'wallet_topup',
            status: 'completed',
            paymentMethod: 'mtn_momo',
            description: `Wallet top-up via MTN MoMo (${topup.amount} ${topup.currency} → $${amountInUSD} USD)`,
          },
        }),
      ]);

      console.log('✅ Wallet balance updated successfully');
      return { status: 'SUCCESSFUL', amountAdded: amountInUSD };
    }

    if (status.status === 'FAILED') {
      console.error('❌ Transaction failed');
      await this.prisma.walletTopUp.update({
        where: { id: topup.id },
        data: { status: 'failed' },
      });
    }

    return { status: status.status };
  }

  // -----------------------------------
  // Orange Money Top-Up
  // -----------------------------------
  async createOrangeTopUp(
    userId: number,
    amount: number,
    paymentMethodId: number,
  ) {
    console.log('💰 createOrangeTopUp called');
    console.log('👤 User ID:', userId);
    console.log('💵 Amount:', amount);
    console.log('💳 Payment Method ID:', paymentMethodId);

    if (amount <= 0) {
      console.error('❌ Invalid amount:', amount);
      throw new BadRequestException('Invalid amount');
    }

    const paymentMethod = await this.prisma.paymentMethod.findFirst({
      where: { id: paymentMethodId, userId },
    });

    if (!paymentMethod || paymentMethod.provider !== 'orange_money') {
      console.error('❌ Invalid Orange Money payment method');
      throw new BadRequestException('Invalid Orange Money payment method');
    }

    const countryCode = paymentMethod.countryCode || 'CI';
    const currency = this.orangeMoneyService.getCurrencyFromCountry(countryCode);
    const orderId = `OM_${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    console.log('🌍 Country code:', countryCode);
    console.log('💰 Currency:', currency);
    console.log('📦 Order ID:', orderId);

    const returnUrl = this.config.get('ORANGE_MONEY_RETURN_URL') || 'http://localhost:5173/wallet/orange/return';
    const cancelUrl = this.config.get('ORANGE_MONEY_CANCEL_URL') || 'http://localhost:5173/wallet/orange/cancel';
    const notifUrl = this.config.get('ORANGE_MONEY_NOTIF_URL') || 'http://localhost:3000/api/wallet-topup/orange/webhook';

    try {
      const session = await this.orangeMoneyService.createPaymentSession({
        amount,
        currency,
        orderId,
        returnUrl,
        cancelUrl,
        notifUrl,
        lang: 'en',
      });

      console.log('✅ Orange Money session created, payToken:', session.payToken);

      const topup = await this.prisma.walletTopUp.create({
        data: {
          userId,
          amount,
          currency: paymentMethod.currency || currency,
          stripeIntentId: session.payToken,
          paymentMethodId: String(paymentMethodId),
          status: 'pending',
        },
      });

      console.log('📝 WalletTopUp record created for Orange Money, id:', topup.id);

      return {
        topupId: topup.id,
        paymentUrl: session.paymentUrl,
        payToken: session.payToken,
        notifToken: session.notifToken,
      };
    } catch (error: any) {
      console.error('🔥 Orange Money payment initiation failed:', error);
      this.logger.error('Orange Money payment initiation failed', error);
      throw new BadRequestException(
        `Failed to initiate Orange Money payment: ${error.message}`,
      );
    }
  }

  async checkOrangeTopUpStatus(topUpId: number, payToken?: string) {
    console.log('🔍 checkOrangeTopUpStatus called for topUpId:', topUpId);

    const topup = await this.prisma.walletTopUp.findUnique({
      where: { id: topUpId },
    });

    if (!topup) {
      console.error('❌ Top-up record not found:', topUpId);
      throw new BadRequestException('Top-up record not found');
    }

    const token = payToken || topup.stripeIntentId;
    if (!token) {
      console.error('❌ No payment token found');
      throw new BadRequestException('No payment token found');
    }

    console.log('🔑 Payment token:', token);

    const orderId = `OM_${topup.userId}_${Date.now()}`;

    const status = await this.orangeMoneyService.checkTransactionStatus({
      orderId,
      amount: topup.amount,
      payToken: token,
    });

    console.log('📊 Orange Money transaction status:', status.status);

    if (status.status === 'SUCCESS') {
      console.log('✅ Transaction successful, converting currency...');
      
      const exchangeResult = await this.exchangeRateService.convert(
        topup.amount,
        topup.currency,
        'USD',
      );
      const amountInUSD = exchangeResult.convertedAmount;
      console.log('💰 Converted amount:', topup.amount, topup.currency, '→', amountInUSD, 'USD');

      await this.prisma.$transaction([
        this.prisma.walletTopUp.update({
          where: { id: topup.id },
          data: { status: 'succeeded' },
        }),
        this.prisma.user.update({
          where: { id: topup.userId },
          data: { walletBalance: { increment: amountInUSD } },
        }),
        this.prisma.transaction.upsert({
          where: { transactionId: token },
          update: { status: 'completed' },
          create: {
            transactionId: token,
            senderId: topup.userId,
            amount: amountInUSD,
            currency: 'USD',
            type: 'wallet_topup',
            status: 'completed',
            paymentMethod: 'orange_money',
            description: `Wallet top-up via Orange Money (${topup.amount} ${topup.currency} → $${amountInUSD} USD)`,
          },
        }),
      ]);

      console.log('✅ Wallet balance updated successfully');
      return { status: 'SUCCESS', amountAdded: amountInUSD };
    }

    if (status.status === 'FAILED' || status.status === 'EXPIRED') {
      console.error('❌ Transaction failed or expired');
      await this.prisma.walletTopUp.update({
        where: { id: topup.id },
        data: { status: 'failed' },
      });
    }

    return { status: status.status };
  }

  async handleOrangeWebhook(body: any) {
    console.log('📞 Orange Money webhook notification received');
    console.log('📦 Webhook body:', JSON.stringify(body, null, 2));

    const payToken = body.pay_token;
    const status = body.status;

    if (!payToken) {
      console.error('❌ Missing pay_token in webhook');
      throw new BadRequestException('Missing pay_token in webhook');
    }

    console.log('🔑 Pay token:', payToken);
    console.log('📊 Status:', status);

    const topup = await this.prisma.walletTopUp.findFirst({
      where: { stripeIntentId: payToken },
    });

    if (!topup) {
      console.warn(`⚠️ No top-up found for payToken: ${payToken}`);
      this.logger.warn(`No top-up found for payToken: ${payToken}`);
      return { received: true };
    }

    console.log('📝 Found top-up record, id:', topup.id);

    if (status === 'SUCCESS') {
      console.log('✅ Processing successful payment...');
      await this.checkOrangeTopUpStatus(topup.id, payToken);
    } else if (status === 'FAILED' || status === 'EXPIRED') {
      console.error('❌ Payment failed or expired');
      await this.prisma.walletTopUp.update({
        where: { id: topup.id },
        data: { status: 'failed' },
      });
    }

    return { received: true };
  }

  // -----------------------------------
  // Transfi (Zamtel) Top-Up
  // -----------------------------------
  async createTransfiTopUp(
    userId: number,
    amount: number,
    paymentMethodId: number,
  ) {
    console.log('💰 createTransfiTopUp called');
    console.log('👤 User ID:', userId);
    console.log('💵 Amount:', amount);
    console.log('💳 Payment Method ID:', paymentMethodId);

    if (amount <= 0) {
      console.error('❌ Invalid amount:', amount);
      throw new BadRequestException('Invalid amount');
    }

    const paymentMethod = await this.prisma.paymentMethod.findFirst({
      where: { id: paymentMethodId, userId },
    });

    if (!paymentMethod || paymentMethod.provider !== 'transfi_zamtel') {
      console.error('❌ Invalid Transfi payment method');
      throw new BadRequestException('Invalid Transfi payment method');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.error('❌ User not found:', userId);
      throw new BadRequestException('User not found');
    }

    let transfiUserId = user.transfiUserId;

    if (!transfiUserId) {
      console.log('🆕 Creating new Transfi user...');
      const names = user.fullName.trim().split(/\s+/);
      const firstName = names[0] || 'First';
      const lastName = names.slice(1).join(' ') || 'Last';
      
      try {
        const transfiUser = await this.transfiService.createUser({
          firstName,
          lastName,
          email: user.email,
          phone: paymentMethod.phoneNumber || user.phoneNumber || '',
          country: 'ZM',
        });
        transfiUserId = transfiUser.userId;
        console.log('✅ Transfi user created:', transfiUserId);

        await this.prisma.user.update({
          where: { id: userId },
          data: { transfiUserId },
        });
      } catch (error: any) {
        console.error('🔥 Failed to register user with Transfi:', error);
        throw new BadRequestException(`Failed to register user with Transfi: ${error.message}`);
      }
    } else {
      console.log('✅ Existing Transfi user found:', transfiUserId);
    }

    const successRedirectUrl = this.config.get('TRANSFI_SUCCESS_REDIRECT_URL') || 'http://localhost:5173/wallet/transfi/return?status=success';
    const failureRedirectUrl = this.config.get('TRANSFI_FAILURE_REDIRECT_URL') || 'http://localhost:5173/wallet/transfi/return?status=failure';

    try {
      const order = await this.transfiService.createOrder({
        userId: transfiUserId,
        amount,
        currency: 'ZMW',
        successRedirectUrl,
        failureRedirectUrl,
      });

      console.log('✅ Transfi order created:', order.orderId);
      console.log('🔗 Payment URL:', order.payUrl);

      const topup = await this.prisma.walletTopUp.create({
        data: {
          userId,
          amount,
          currency: 'ZMW',
          stripeIntentId: order.orderId,
          paymentMethodId: String(paymentMethodId),
          status: 'pending',
        },
      });

      console.log('📝 WalletTopUp record created for Transfi, id:', topup.id);

      return {
        topupId: topup.id,
        payUrl: order.payUrl,
        orderId: order.orderId,
      };
    } catch (error: any) {
      console.error('🔥 Transfi payment initiation failed:', error);
      this.logger.error('Transfi payment initiation failed', error);
      throw new BadRequestException(`Failed to initiate Transfi payment: ${error.message}`);
    }
  }

  async checkTransfiTopUpStatus(topUpId: number, orderId?: string) {
    console.log('🔍 checkTransfiTopUpStatus called for topUpId:', topUpId);

    const topup = await this.prisma.walletTopUp.findUnique({
      where: { id: topUpId },
    });

    if (!topup) {
      console.error('❌ Top-up record not found:', topUpId);
      throw new BadRequestException('Top-up record not found');
    }

    const oId = orderId || topup.stripeIntentId;
    if (!oId) {
      console.error('❌ No order ID found');
      throw new BadRequestException('No order ID found');
    }

    console.log('📦 Checking status for orderId:', oId);

    try {
      const statusData = await this.transfiService.getOrderStatus(oId);
      console.log('📊 Transfi order status:', statusData.status);

      if (statusData.status === 'fund_settled') {
        console.log('✅ Transaction settled, converting currency...');
        
        const exchangeResult = await this.exchangeRateService.convert(
          topup.amount,
          topup.currency,
          'USD',
        );
        const amountInUSD = exchangeResult.convertedAmount;
        console.log('💰 Converted amount:', topup.amount, topup.currency, '→', amountInUSD, 'USD');

        await this.prisma.$transaction([
          this.prisma.walletTopUp.update({
            where: { id: topup.id },
            data: { status: 'succeeded' },
          }),
          this.prisma.user.update({
            where: { id: topup.userId },
            data: { walletBalance: { increment: amountInUSD } },
          }),
          this.prisma.transaction.upsert({
            where: { transactionId: oId },
            update: { status: 'completed' },
            create: {
              transactionId: oId,
              senderId: topup.userId,
              amount: amountInUSD,
              currency: 'USD',
              type: 'wallet_topup',
              status: 'completed',
              paymentMethod: 'transfi_zamtel',
              description: `Wallet top-up via Zamtel (${topup.amount} ${topup.currency} → $${amountInUSD} USD)`,
            },
          }),
        ]);

        console.log('✅ Wallet balance updated successfully');
        return { status: 'fund_settled', amountAdded: amountInUSD };
      }

      if (statusData.status === 'fund_failed') {
        console.error('❌ Transaction failed');
        await this.prisma.walletTopUp.update({
          where: { id: topup.id },
          data: { status: 'failed' },
        });
      }

      return { status: statusData.status };
    } catch (error: any) {
      console.error('🔥 Error checking Transfi status:', error);
      this.logger.error(`Error checking Transfi status for order ${oId}: ${error.message}`);
      return { status: 'initiated' };
    }
  }

  async handleTransfiWebhook(body: any) {
    console.log('📞 Transfi webhook notification received');
    console.log('📦 Webhook body:', JSON.stringify(body, null, 2));

    const orderId = body.order?.orderId || (body.entityType === 'order' ? body.entityId : null);
    const status = body.status;

    if (!orderId) {
      console.warn('⚠️ Transfi webhook missing orderId');
      this.logger.warn('Transfi webhook missing orderId');
      return { received: true };
    }

    console.log('📦 Order ID:', orderId);
    console.log('📊 Status:', status);

    const topup = await this.prisma.walletTopUp.findFirst({
      where: { stripeIntentId: orderId },
    });

    if (!topup) {
      console.warn(`⚠️ No top-up found for Transfi orderId: ${orderId}`);
      this.logger.warn(`No top-up found for Transfi orderId: ${orderId}`);
      return { received: true };
    }

    console.log('📝 Found top-up record, id:', topup.id);

    if (status === 'fund_settled') {
      console.log('✅ Processing settled payment...');
      await this.checkTransfiTopUpStatus(topup.id, orderId);
    } else if (status === 'fund_failed') {
      console.error('❌ Payment failed');
      await this.prisma.walletTopUp.update({
        where: { id: topup.id },
        data: { status: 'failed' },
      });
    }

    return { received: true };
  }

  /**
   * Compute wallet balance from transactions table
   * Always the source of truth
   */
  async computeWalletBalance(userId: number, currency?: string) {
    console.log('🔍 computeWalletBalance called for userId:', userId);

    // Money IN: Wallet topups + Received transfers
    const moneyInAgg = await this.prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        OR: [
          { senderId: userId, type: 'wallet_topup', status: 'completed' },
          { recipientId: userId, type: 'wallet_transfer', status: 'completed' },
        ],
        ...(currency ? { currency } : {}),
      },
    });

    // Money OUT: Sent transfers (including fees)
    const moneyOutAgg = await this.prisma.transaction.aggregate({
      _sum: { amount: true, fee: true },
      where: {
        senderId: userId,
        type: 'wallet_transfer',
        status: 'completed',
        ...(currency ? { currency } : {}),
      },
    });

    const moneyIn = toNumber(moneyInAgg._sum.amount || 0);
    const moneyOut = toNumber(moneyOutAgg._sum.amount || 0) + toNumber(moneyOutAgg._sum.fee || 0);

    const balance = Number(moneyIn) - Number(moneyOut);
    console.log('💰 Computed balance:', balance);

    return balance;
  }

  /**
   * Get monthly money in/out stats
   */
  async getMonthlyStats(userId: number) {
    console.log('📊 getMonthlyStats called for userId:', userId);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    console.log('📅 Date range:', startOfMonth, 'to', endOfMonth);

    const moneyInAgg = await this.prisma.transaction.aggregate({
      _sum: { amount: true, fee: true },
      where: { 
        recipientId: userId, 
        status: 'completed', 
        createdAt: { gte: startOfMonth, lte: endOfMonth } 
      },
    });

    const moneyOutAgg = await this.prisma.transaction.aggregate({
      _sum: { amount: true, fee: true },
      where: { 
        senderId: userId, 
        status: 'completed', 
        NOT: { type: 'wallet_topup' }, 
        createdAt: { gte: startOfMonth, lte: endOfMonth } 
      },
    });

    const moneyIn = toNumber(moneyInAgg._sum.amount || 0);
    const moneyOut = toNumber(moneyOutAgg._sum.amount || 0) + toNumber(moneyOutAgg._sum.fee || 0);

    const result = { 
      moneyIn, 
      moneyOut, 
      net: toNumber(moneyIn) - toNumber(moneyOut) 
    };

    console.log('📊 Monthly stats:', result);
    return result;
  }

  async getPlatformStats() {
    console.log('📊 getPlatformStats called');

    // 💰 Total Top Up
    const topUpAgg = await this.prisma.walletTopUp.aggregate({
      _sum: { amount: true },
      where: { status: 'succeeded' },
    });

    // 📤 Total Payout (money sent out by platform)
    const payoutAgg = await this.prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        status: 'completed',
        type: 'payout',
      },
    });

    // 💸 Transaction Fees Collected
    const feeAgg = await this.prisma.transaction.aggregate({
      _sum: { fee: true },
      where: { status: 'completed' },
    });

    // 🧾 Fee payouts (if fees are withdrawn separately)
    const feePayoutAgg = await this.prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        status: 'completed',
        type: 'fee_payout',
      },
    });

    const totalTopUp = topUpAgg._sum.amount || 0;
    const totalPayout = payoutAgg._sum.amount || 0;
    const totalFee = feeAgg._sum.fee || 0;
    const feePayout = feePayoutAgg._sum.amount || 0;

    const result = {
      platformBalance: toNumber(totalTopUp) - toNumber(totalPayout),
      totalTopUp,
      totalPayout,
      totalTransactionFee: totalFee,
      totalFeePayout: feePayout,
      totalFeeBalance: toNumber(totalFee) - toNumber(feePayout),
    };

    console.log('📊 Platform stats:', result);
    return result;
  }
}