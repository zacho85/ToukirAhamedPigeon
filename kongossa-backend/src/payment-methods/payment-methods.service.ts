import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';

@Injectable()
export class PaymentMethodsService {
  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
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

        // 🔐 VERIFY customer exists in CURRENT Stripe account
        if (customerId) {
            try {
            await this.stripeService.client.customers.retrieve(customerId);
            return customerId;
            } catch {
            // customer belongs to old Stripe account
            customerId = null;
            }
        }

        // 🆕 CREATE customer in current Stripe account
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
        const customerId = await this.getOrCreateCustomer(userId)

        const setupIntent = await this.stripeService.client.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card'],
        })

        return { clientSecret: setupIntent.client_secret }
    } catch (error) {
        console.error('Error creating setup intent:', error)
        throw new Error('Failed to create setup intent')
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
        type: "card",
        provider: "stripe",

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
  // List Payment Methods
  // -----------------------------------
  async list(userId: number) {
    try {
        return this.prisma.paymentMethod.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        })
    } catch (error) {
        console.error('Error listing payment methods:', error)
        throw new Error('Failed to list payment methods')
    }
}

  // -----------------------------------
  // Delete Payment Method
  // -----------------------------------
  async remove(userId: number, id: number) {
    const pm = await this.prisma.paymentMethod.findFirst({
      where: { id, userId },
    });

    if (!pm) throw new BadRequestException('Not found');

    if (pm.stripePmId) {
      await this.stripeService.client.paymentMethods.detach(pm.stripePmId);
    }

    return this.prisma.paymentMethod.delete({ where: { id }});
  }
}
