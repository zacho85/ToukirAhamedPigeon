/**
 * Integration tests for the agent money paths: cash in, customer-started cash
 * out (customer OTP, then the agent's cash hand-over), customer-approved
 * transfer, admin wallet adjustments, concurrency and rollback; plus the
 * customer's own money paths that charge platform fees (Send Money, bank payout).
 *
 * They run against a real PostgreSQL database: the one named in DATABASE_URL
 * with "_test" appended (e.g. kongossa_m3_test), or TEST_DATABASE_URL if set.
 * Pending migrations are applied with `prisma migrate deploy` (created if
 * missing), and the tests delete the rows they work with. The name must end
 * in "_test", so a development or production database is never touched.
 * OTP and mail delivery are faked; everything else is the real service and database.
 *
 *   npm test
 */
import 'dotenv/config';
import { execSync } from 'child_process';
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AgentsService } from './agents.service';
import { FeesService, PLATFORM_ACCOUNT_EMAIL } from '../fees/fees.service';
import { WalletPayoutService } from '../wallet-payout/wallet-payout.service';
import { TransactionsService } from '../transactions/transactions.service';

const TEST_OTP = '123456';

function testDatabaseUrl(): string {
  if (process.env.TEST_DATABASE_URL) return process.env.TEST_DATABASE_URL;
  const url = new URL(process.env.DATABASE_URL || '');
  url.pathname = `${url.pathname.replace(/_test$/, '')}_test`;
  return url.toString();
}

const DB_URL = testDatabaseUrl();
const DB_NAME = new URL(DB_URL).pathname.slice(1);
if (!DB_NAME.endsWith('_test')) {
  throw new Error(`Refusing to run: test database "${DB_NAME}" must end with "_test".`);
}

jest.setTimeout(120_000);

describe('Agent money paths (integration)', () => {
  let prisma: PrismaService;
  let service: AgentsService;
  let payouts: WalletPayoutService;
  let transactions: TransactionsService;
  let ids: { admin: number; agentUser: number; agent: number; u1: number; u2: number };
  let ids_platform: number;

  const fakeOtp = {
    sendOtp: jest.fn(async () => ({ success: true })),
    verifyOtp: async (_email: string, code: string) => {
      if (code !== TEST_OTP) throw new BadRequestException('Invalid OTP');
      return { success: true };
    },
  };

  const fakeMail = { sendReceiptEmail: jest.fn(async () => undefined) };
  const fakeStripe = { client: { payouts: { create: jest.fn(async () => ({ id: `po_test_${Date.now()}` })) } } };

  const agentProfile = () => prisma.agentProfile.findUniqueOrThrow({ where: { id: ids.agent } });
  const wallet = async (id: number) => (await prisma.user.findUniqueOrThrow({ where: { id } })).walletBalance;
  const cash = async () => Number((await agentProfile()).cashOnHand);

  /** Opening balance plus every ledger row touching the user must equal the wallet. */
  async function expectLedgerMatchesWallet(userId: number, opening: number) {
    const rows = await prisma.transaction.findMany({ where: { OR: [{ senderId: userId }, { recipientId: userId }] } });
    const fromLedger = rows.reduce((sum, r) => sum + (r.recipientId === userId ? 1 : -1) * Number(r.amount), opening);
    expect(await wallet(userId)).toBeCloseTo(fromLedger, 2);
  }

  async function resetState(opts: { cash?: number; u1?: number; u2?: number } = {}) {
    await prisma.agentWalletAdjustment.deleteMany();
    await prisma.agentCashTransaction.deleteMany();
    await prisma.agentDaySettlement.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.walletPayout.deleteMany();
    await prisma.user.update({ where: { id: ids.u1 }, data: { walletBalance: opts.u1 ?? 1000, stripeConnectId: 'acct_test' } });
    await prisma.user.update({ where: { id: ids.u2 }, data: { walletBalance: opts.u2 ?? 50 } });
    await prisma.user.update({ where: { id: ids.agentUser }, data: { walletBalance: 0 } });
    await prisma.user.update({ where: { id: ids_platform }, data: { walletBalance: 0 } });
    await prisma.agentProfile.update({ where: { id: ids.agent }, data: { cashOnHand: 0 } });
    await service.startDay(await agentProfile(), { startCash: opts.cash ?? 1000 });
  }

  beforeAll(async () => {
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: DB_URL },
      stdio: 'ignore',
    });

    prisma = new PrismaService({ datasources: { db: { url: DB_URL } } });
    await prisma.$connect();
    service = new AgentsService(prisma, fakeOtp as any, fakeMail as any, new FeesService(prisma));
    payouts = new WalletPayoutService(prisma, fakeStripe as any, new FeesService(prisma));
    transactions = new TransactionsService(prisma, null as any, new FeesService(prisma), fakeMail as any);
    // Default fee settings apply (no SystemSettings row): cash out 0.5%,
    // transfers free up to 13 per day then 0.5%.
    await prisma.systemSettings.deleteMany();
    ids_platform = (await prisma.user.findUniqueOrThrow({ where: { email: PLATFORM_ACCOUNT_EMAIL } })).id;

    // Leftovers from an earlier run of this suite.
    await prisma.agentWalletAdjustment.deleteMany();
    await prisma.agentCashTransaction.deleteMany();
    await prisma.agentDaySettlement.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.walletPayout.deleteMany();
    await prisma.agentProfile.deleteMany({ where: { agentCode: 'AG-TEST' } });
    await prisma.user.deleteMany({ where: { email: { endsWith: '@test.local' } } });

    const person = (email: string, fullName: string, phoneNumber: string, walletBalance: number) =>
      prisma.user.create({
        data: {
          email, fullName, phoneNumber, walletBalance,
          role: 'personal', address: 'Test', country: 'KE', dateOfBirth: new Date('1990-01-01'),
        },
      });
    const admin = await person('admin@test.local', 'Admin', '+254700000900', 0);
    const agentUser = await person('agent@test.local', 'Agent', '+254700000901', 0);
    const u1 = await person('u1@test.local', 'User One', '+254700000902', 1000);
    const u2 = await person('u2@test.local', 'User Two', '+254700000903', 50);
    const agent = await prisma.agentProfile.create({
      data: { userId: agentUser.id, agentCode: 'AG-TEST', status: 'active', kycStatus: 'verified', commissionRate: 2 },
    });
    ids = { admin: admin.id, agentUser: agentUser.id, agent: agent.id, u1: u1.id, u2: u2.id };
  });

  afterAll(async () => {
    await prisma?.$disconnect();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    return resetState();
  });

  it('cash in credits the user, adds to cash on hand and pays commission, with ledger rows', async () => {
    await service.processCashIn(await agentProfile(), { customer: 'u1@test.local', amount: 100 });

    expect(await wallet(ids.u1)).toBe(1100);
    expect(await cash()).toBe(1100);
    expect(await wallet(ids.agentUser)).toBe(2);
    expect(await prisma.transaction.count({ where: { type: 'agent_cash_in', recipientId: ids.u1 } })).toBe(1);
    expect(await prisma.transaction.count({ where: { type: 'agent_commission', recipientId: ids.agentUser } })).toBe(1);
    await expectLedgerMatchesWallet(ids.u1, 1000);
    await expectLedgerMatchesWallet(ids.agentUser, 0);
  });

  /** Customer u1 starts a cash-out at the test agent and enters the right code. */
  async function approvedCashOut(amount: number, userId = ids.u1) {
    const started = await service.createCustomerCashOut(userId, { agentCode: 'ag-test', amount });
    await service.confirmCustomerRequest(userId, started.id, TEST_OTP);
    return started.id;
  }

  it('cash out: the customer starts and approves, money moves only when the agent gives the cash', async () => {
    const started = await service.createCustomerCashOut(ids.u1, { agentCode: 'AG-TEST', amount: 100 });
    expect(started.status).toBe('pending_otp');
    expect(fakeOtp.sendOtp).toHaveBeenLastCalledWith(
      'u1@test.local',
      'agent_cashout',
      ids.u1,
      expect.arrayContaining([['Cash out', '$100.00'], ['Agent', 'Agent (AG-TEST)']]),
    );

    await expect(service.confirmCustomerRequest(ids.u1, started.id, '000000')).rejects.toThrow('Invalid OTP');
    const approved: any = await service.confirmCustomerRequest(ids.u1, started.id, TEST_OTP);
    expect(approved.status).toBe('awaiting_agent');
    expect(await wallet(ids.u1)).toBe(1000);
    expect(await cash()).toBe(1000);

    const requests = await service.getCashOutRequests(await agentProfile());
    expect(requests.map((r) => r.id)).toEqual([started.id]);

    await service.completeCashOut(await agentProfile(), started.id);
    // 0.5% fee on top: the customer pays 100.50, the agent hands over 100.
    expect(await wallet(ids.u1)).toBe(899.5);
    expect(await cash()).toBe(900);
    expect(await wallet(ids.agentUser)).toBe(2);
    // Platform: +0.50 fee, -2.00 commission.
    expect(await wallet(ids_platform)).toBe(-1.5);
    await expectLedgerMatchesWallet(ids.u1, 1000);
    await expectLedgerMatchesWallet(ids.agentUser, 0);
    await expectLedgerMatchesWallet(ids_platform, 0);
    expect(fakeMail.sendReceiptEmail).toHaveBeenCalledWith('u1@test.local', 'Cash-out receipt', expect.anything());
    expect(fakeMail.sendReceiptEmail).toHaveBeenCalledWith('agent@test.local', 'Cash-out completed', expect.anything());

    await expect(service.completeCashOut(await agentProfile(), started.id)).rejects.toThrow('no longer open');
    expect(await wallet(ids.u1)).toBe(899.5);
  });

  it('the agent cannot complete a cash-out the customer has not approved', async () => {
    const started = await service.createCustomerCashOut(ids.u1, { agentCode: 'AG-TEST', amount: 100 });
    await expect(service.completeCashOut(await agentProfile(), started.id)).rejects.toThrow(
      "waiting for the customer's confirmation",
    );
    expect(await wallet(ids.u1)).toBe(1000);
    expect(await cash()).toBe(1000);
  });

  it('a cancelled, declined or expired cash-out moves nothing', async () => {
    const cancelledId = await approvedCashOut(100);
    await service.cancelCustomerRequest(ids.u1, cancelledId);
    await expect(service.completeCashOut(await agentProfile(), cancelledId)).rejects.toThrow('no longer open');

    const declinedId = await approvedCashOut(100);
    await service.declineCashOut(await agentProfile(), declinedId);
    await expect(service.completeCashOut(await agentProfile(), declinedId)).rejects.toThrow('no longer open');
    await expect(service.cancelCustomerRequest(ids.u1, declinedId)).rejects.toThrow('can no longer be cancelled');

    const expiredId = await approvedCashOut(100);
    await prisma.agentCashTransaction.update({
      where: { id: expiredId },
      data: { createdAt: new Date(Date.now() - 16 * 60 * 1000) },
    });
    await expect(service.completeCashOut(await agentProfile(), expiredId)).rejects.toThrow('expired');
    expect((await prisma.agentCashTransaction.findUniqueOrThrow({ where: { id: expiredId } })).status).toBe('expired');

    expect(await wallet(ids.u1)).toBe(1000);
    expect(await cash()).toBe(1000);
    expect(await prisma.transaction.count()).toBe(0);
  });

  it('cancels a pending cash-out after 5 wrong codes', async () => {
    const started = await service.createCustomerCashOut(ids.u1, { agentCode: 'AG-TEST', amount: 600 });
    for (let i = 0; i < 4; i++) {
      await expect(service.confirmCustomerRequest(ids.u1, started.id, '000000')).rejects.toThrow();
    }
    await expect(service.confirmCustomerRequest(ids.u1, started.id, '000000')).rejects.toThrow('cancelled');
    await expect(service.confirmCustomerRequest(ids.u1, started.id, TEST_OTP)).rejects.toThrow();
    await expect(service.completeCashOut(await agentProfile(), started.id)).rejects.toThrow();
    expect(await wallet(ids.u1)).toBe(1000);
  });

  it('rejects a cash-out the customer or agent cannot cover, a closed agent, and someone else\'s request', async () => {
    await resetState({ cash: 500 });
    await expect(service.createCustomerCashOut(ids.u2, { agentCode: 'AG-TEST', amount: 51 })).rejects.toThrow(
      'balance is insufficient',
    );
    await expect(service.createCustomerCashOut(ids.u1, { agentCode: 'AG-TEST', amount: 600 })).rejects.toThrow(
      'enough cash',
    );
    await expect(service.createCustomerCashOut(ids.agentUser, { agentCode: 'AG-TEST', amount: 1 })).rejects.toThrow(
      'your own agent account',
    );
    await expect(service.createCustomerCashOut(ids.u1, { agentCode: 'AG-NOPE', amount: 1 })).rejects.toThrow(
      'No active agent',
    );

    const started = await service.createCustomerCashOut(ids.u1, { agentCode: 'AG-TEST', amount: 100 });
    await expect(service.confirmCustomerRequest(ids.u2, started.id, TEST_OTP)).rejects.toThrow('not found');
    await expect(service.cancelCustomerRequest(ids.u2, started.id)).rejects.toThrow();

    await service.endDay(await agentProfile(), { endCash: 1000 });
    await expect(service.createCustomerCashOut(ids.u1, { agentCode: 'AG-TEST', amount: 100 })).rejects.toThrow(
      'not open',
    );
    expect(await wallet(ids.u1)).toBe(1000);
  });

  it('transfer moves money only after the sender enters the code in their own app', async () => {
    const pending: any = await service.processTransfer(await agentProfile(), {
      sender: 'u1@test.local',
      recipient: 'u2@test.local',
      amount: 30,
    });
    expect(pending.status).toBe('pending_otp');
    expect(fakeOtp.sendOtp).toHaveBeenLastCalledWith(
      'u1@test.local',
      'agent_transfer',
      ids.u1,
      expect.arrayContaining([['Transfer', '$30.00'], ['To', 'User Two']]),
    );
    expect(await wallet(ids.u1)).toBe(1000);

    await expect(service.confirmCustomerRequest(ids.u2, pending.id, TEST_OTP)).rejects.toThrow('not found');
    await service.confirmCustomerRequest(ids.u1, pending.id, TEST_OTP);

    // 13 of the 30 are free today; 0.5% of the other 17 is 0.085 -> 0.09.
    expect(await wallet(ids.u1)).toBe(969.91);
    expect(await wallet(ids.u2)).toBe(80);
    expect(await cash()).toBe(1000);
    expect(await wallet(ids.agentUser)).toBe(0);
    expect(await wallet(ids_platform)).toBe(0.09);
    await expectLedgerMatchesWallet(ids.u1, 1000);
    await expectLedgerMatchesWallet(ids.u2, 50);
    await expectLedgerMatchesWallet(ids_platform, 0);
    expect(fakeMail.sendReceiptEmail).toHaveBeenCalledWith('u2@test.local', 'Money received', expect.anything());

    await expect(service.confirmCustomerRequest(ids.u1, pending.id, TEST_OTP)).rejects.toThrow('not waiting');
    expect(await wallet(ids.u1)).toBe(969.91);
  });

  it('admin credit and debit change the agent wallet with ledger and audit rows; no overdraft', async () => {
    await service.adjustAgentWallet(ids.agent, { direction: 'credit', amount: 100, reason: 'Test credit' }, ids.admin);
    await service.adjustAgentWallet(ids.agent, { direction: 'debit', amount: 40, reason: 'Test debit' }, ids.admin);
    expect(await wallet(ids.agentUser)).toBe(60);
    expect(await cash()).toBe(1000);

    await expect(
      service.adjustAgentWallet(ids.agent, { direction: 'debit', amount: 61, reason: 'Too much' }, ids.admin),
    ).rejects.toThrow('insufficient');
    expect(await wallet(ids.agentUser)).toBe(60);
    expect(await prisma.agentWalletAdjustment.count()).toBe(2);
    await expectLedgerMatchesWallet(ids.agentUser, 0);
  });

  it('two cash-outs given at the same moment cannot take cash on hand below zero', async () => {
    await prisma.agentDaySettlement.deleteMany();
    await prisma.agentProfile.update({ where: { id: ids.agent }, data: { cashOnHand: 0 } });
    await service.startDay(await agentProfile(), { startCash: 100 });

    const first = await approvedCashOut(80);
    const second = await approvedCashOut(80);
    const profile = await agentProfile();
    const results = await Promise.allSettled([
      service.completeCashOut(profile, first),
      service.completeCashOut(profile, second),
    ]);

    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(await cash()).toBe(20);
    expect(await wallet(ids.u1)).toBe(919.6); // 80 + 0.40 fee
  });

  it('the same cash-out given twice at the same moment pays out once', async () => {
    const id = await approvedCashOut(100);
    const profile = await agentProfile();
    const results = await Promise.allSettled([service.completeCashOut(profile, id), service.completeCashOut(profile, id)]);

    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(await cash()).toBe(900);
    expect(await wallet(ids.u1)).toBe(899.5);
    await expectLedgerMatchesWallet(ids.u1, 1000);
  });

  it('the transfer fee applies only above the daily free amount, across transfers', async () => {
    const send = async (amount: number) => {
      const pending: any = await service.processTransfer(await agentProfile(), {
        sender: 'u1@test.local',
        recipient: 'u2@test.local',
        amount,
      });
      await service.confirmCustomerRequest(ids.u1, pending.id, TEST_OTP);
      return pending;
    };

    const first = await send(10); // 10 of the 13 free
    expect(first.fee).toBe(0);
    const second = await send(10); // 3 free, 7 charged -> 0.035 -> 0.04
    expect(second.fee).toBe(0.04);
    const third = await send(10); // nothing free left -> 0.05
    expect(third.fee).toBe(0.05);

    // walletBalance is a Float column, so compare to the cent.
    expect(await wallet(ids.u1)).toBeCloseTo(969.91, 2);
    expect(await wallet(ids_platform)).toBeCloseTo(0.09, 2);
    await expectLedgerMatchesWallet(ids.u1, 1000);
    await expectLedgerMatchesWallet(ids_platform, 0);
  });

  it('a cash-out the customer cannot cover with the fee is refused before any code is sent', async () => {
    await prisma.user.update({ where: { id: ids.u1 }, data: { walletBalance: 100 } });
    await expect(service.createCustomerCashOut(ids.u1, { agentCode: 'AG-TEST', amount: 100 })).rejects.toThrow(
      'insufficient',
    );
    expect(fakeOtp.sendOtp).not.toHaveBeenCalled();
  });

  it('rolls back every balance change when a step inside the transaction fails', async () => {
    // Make the ledger insert (the last step) fail on a duplicate transactionId.
    await prisma.transaction.create({ data: { transactionId: 'DUP-REF', type: 'test', status: 'completed' } });
    jest.spyOn(service as any, 'generateReference').mockReturnValueOnce('DUP-REF');

    await expect(
      service.processCashIn(await agentProfile(), { customer: 'u1@test.local', amount: 100 }),
    ).rejects.toThrow();

    expect(await wallet(ids.u1)).toBe(1000);
    expect(await cash()).toBe(1000);
    expect(await wallet(ids.agentUser)).toBe(0);
    expect(await prisma.agentCashTransaction.count()).toBe(0);
  });
  it('bank payout: the withdrawal fee is paid on top and reaches the platform with its own ledger row', async () => {
    const res = await payouts.requestPayout(ids.u1, 100);

    expect(res).toMatchObject({ amount: 100, fee: 0.5, total: 100.5 });
    expect(fakeStripe.client.payouts.create).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 10000 }),
      expect.objectContaining({ stripeAccount: 'acct_test' }),
    );
    expect(await wallet(ids.u1)).toBe(899.5);
    expect(await wallet(ids_platform)).toBe(0.5);
    expect(await prisma.transaction.count({ where: { type: 'wallet_payout', senderId: ids.u1 } })).toBe(1);
    expect(await prisma.transaction.count({ where: { type: 'platform_fee', senderId: ids.u1, recipientId: ids_platform } })).toBe(1);
    expect((await prisma.walletPayout.findFirstOrThrow()).status).toBe('completed');
    await expectLedgerMatchesWallet(ids.u1, 1000);
    await expectLedgerMatchesWallet(ids_platform, 0);
  });

  it('bank payout: a failed Stripe payout refunds amount and fee, and the platform gets nothing', async () => {
    fakeStripe.client.payouts.create.mockRejectedValueOnce(new Error('Stripe down'));

    await expect(payouts.requestPayout(ids.u1, 100)).rejects.toThrow('Stripe down');

    expect(await wallet(ids.u1)).toBe(1000);
    expect(await wallet(ids_platform)).toBe(0);
    expect(await prisma.transaction.count()).toBe(0);
    expect((await prisma.walletPayout.findFirstOrThrow()).status).toBe('failed');
  });

  it('bank payout: refused before any debit without a Stripe account or when the fee is not covered', async () => {
    await expect(payouts.requestPayout(ids.u1, 1000)).rejects.toThrow('Insufficient balance');
    await prisma.user.update({ where: { id: ids.u1 }, data: { stripeConnectId: null } });
    await expect(payouts.requestPayout(ids.u1, 100)).rejects.toThrow('not connected to Stripe');

    expect(await wallet(ids.u1)).toBe(1000);
    expect(await prisma.walletPayout.count()).toBe(0);
    expect(fakeStripe.client.payouts.create).not.toHaveBeenCalled();
  });

  it('send money emails a receipt with the fee to the sender and one to the recipient', async () => {
    await transactions.sendMoney(ids.u1, { recipientId: ids.u2, amount: 113 });

    expect(await wallet(ids.u1)).toBe(886.5); // 100 above the free 13 → 0.50 fee on top
    expect(fakeMail.sendReceiptEmail).toHaveBeenCalledWith(
      'u1@test.local',
      'Transfer receipt',
      expect.arrayContaining([['Fee', '$0.50'], ['Total from your wallet', '$113.50']]),
    );
    expect(fakeMail.sendReceiptEmail).toHaveBeenCalledWith('u2@test.local', 'Money received', expect.anything());
  });

  it('send money still completes when the receipt email fails', async () => {
    fakeMail.sendReceiptEmail.mockRejectedValue(new Error('SMTP down'));

    await transactions.sendMoney(ids.u1, { recipientId: ids.u2, amount: 10 });
    fakeMail.sendReceiptEmail.mockResolvedValue(undefined);

    expect(await wallet(ids.u1)).toBe(990);
    expect(await wallet(ids.u2)).toBe(60);
  });
});
