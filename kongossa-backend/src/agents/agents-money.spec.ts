/**
 * Integration tests for the agent money paths: cash in, cash out (with and
 * without OTP), transfer, admin wallet adjustments, concurrency and rollback.
 *
 * They run against a real PostgreSQL database: the one named in DATABASE_URL
 * with "_test" appended (e.g. kongossa_m3_test), or TEST_DATABASE_URL if set.
 * Pending migrations are applied with `prisma migrate deploy` (created if
 * missing), and the tests delete the rows they work with. The name must end
 * in "_test", so a development or production database is never touched.
 * OTP delivery is faked; everything else is the real service and database.
 *
 *   npm test
 */
import 'dotenv/config';
import { execSync } from 'child_process';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AgentsService } from './agents.service';

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
  let ids: { admin: number; agentUser: number; agent: number; u1: number; u2: number };

  const fakeOtp = {
    sendOtp: jest.fn(async () => ({ success: true })),
    verifyOtp: async (_email: string, code: string) => {
      if (code !== TEST_OTP) throw new BadRequestException('Invalid OTP');
      return { success: true };
    },
  };

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
    await prisma.user.update({ where: { id: ids.u1 }, data: { walletBalance: opts.u1 ?? 1000 } });
    await prisma.user.update({ where: { id: ids.u2 }, data: { walletBalance: opts.u2 ?? 50 } });
    await prisma.user.update({ where: { id: ids.agentUser }, data: { walletBalance: 0 } });
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
    service = new AgentsService(prisma, fakeOtp as any, new ConfigService({}), {} as any);

    // Leftovers from an earlier run of this suite.
    await prisma.agentWalletAdjustment.deleteMany();
    await prisma.agentCashTransaction.deleteMany();
    await prisma.agentDaySettlement.deleteMany();
    await prisma.transaction.deleteMany();
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

  beforeEach(() => resetState());

  it('cash in credits the user, adds to cash on hand and pays commission, with ledger rows', async () => {
    await service.processCashIn(await agentProfile(), { userEmail: 'u1@test.local', amount: 100 });

    expect(await wallet(ids.u1)).toBe(1100);
    expect(await cash()).toBe(1100);
    expect(await wallet(ids.agentUser)).toBe(2);
    expect(await prisma.transaction.count({ where: { type: 'agent_cash_in', recipientId: ids.u1 } })).toBe(1);
    expect(await prisma.transaction.count({ where: { type: 'agent_commission', recipientId: ids.agentUser } })).toBe(1);
    await expectLedgerMatchesWallet(ids.u1, 1000);
    await expectLedgerMatchesWallet(ids.agentUser, 0);
  });

  it('cash out below the OTP threshold completes at once', async () => {
    const tx = await service.processCashOut(await agentProfile(), { userEmail: 'u1@test.local', amount: 100 });

    expect(tx.status).toBe('completed');
    expect(await wallet(ids.u1)).toBe(900);
    expect(await cash()).toBe(900);
    expect(await wallet(ids.agentUser)).toBe(2);
    await expectLedgerMatchesWallet(ids.u1, 1000);
  });

  it('cash out above the threshold moves nothing until the customer OTP, and only once', async () => {
    const pending: any = await service.processCashOut(await agentProfile(), { userEmail: 'u1@test.local', amount: 600 });
    expect(pending.requiresOtp).toBe(true);
    expect(await wallet(ids.u1)).toBe(1000);

    await expect(service.confirmCashOut(await agentProfile(), pending.id, { code: '000000' })).rejects.toThrow('Invalid OTP');
    expect(await wallet(ids.u1)).toBe(1000);

    await service.confirmCashOut(await agentProfile(), pending.id, { code: TEST_OTP });
    expect(await wallet(ids.u1)).toBe(400);
    expect(await cash()).toBe(400);
    expect(await wallet(ids.agentUser)).toBe(12);

    await expect(service.confirmCashOut(await agentProfile(), pending.id, { code: TEST_OTP })).rejects.toThrow(
      'not awaiting OTP',
    );
    expect(await wallet(ids.u1)).toBe(400);
    await expectLedgerMatchesWallet(ids.u1, 1000);
  });

  it('cancels a pending cash-out after 5 wrong codes', async () => {
    const pending: any = await service.processCashOut(await agentProfile(), { userEmail: 'u1@test.local', amount: 600 });
    for (let i = 0; i < 4; i++) {
      await expect(service.confirmCashOut(await agentProfile(), pending.id, { code: '000000' })).rejects.toThrow();
    }
    await expect(service.confirmCashOut(await agentProfile(), pending.id, { code: '000000' })).rejects.toThrow(
      'cancelled',
    );
    await expect(service.confirmCashOut(await agentProfile(), pending.id, { code: TEST_OTP })).rejects.toThrow();
    expect(await wallet(ids.u1)).toBe(1000);
  });

  it('transfer moves money between customers without touching cash or commission', async () => {
    await service.processTransfer(await agentProfile(), {
      senderEmail: 'u1@test.local',
      recipientEmail: 'u2@test.local',
      amount: 30,
    });

    expect(await wallet(ids.u1)).toBe(970);
    expect(await wallet(ids.u2)).toBe(80);
    expect(await cash()).toBe(1000);
    expect(await wallet(ids.agentUser)).toBe(0);
    await expectLedgerMatchesWallet(ids.u1, 1000);
    await expectLedgerMatchesWallet(ids.u2, 50);
  });

  it('transfer above the threshold waits for the sender OTP', async () => {
    const pending: any = await service.processTransfer(await agentProfile(), {
      senderEmail: 'u1@test.local',
      recipientEmail: 'u2@test.local',
      amount: 700,
    });
    expect(pending.requiresOtp).toBe(true);
    expect(await wallet(ids.u1)).toBe(1000);

    await service.confirmTransfer(await agentProfile(), pending.id, { code: TEST_OTP });
    expect(await wallet(ids.u1)).toBe(300);
    expect(await wallet(ids.u2)).toBe(750);
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

  it('two cash-outs at the same moment cannot take cash on hand below zero', async () => {
    await prisma.agentDaySettlement.deleteMany();
    await prisma.agentProfile.update({ where: { id: ids.agent }, data: { cashOnHand: 0 } });
    await service.startDay(await agentProfile(), { startCash: 100 });

    const profile = await agentProfile();
    const results = await Promise.allSettled([
      service.processCashOut(profile, { userEmail: 'u1@test.local', amount: 80 }),
      service.processCashOut(profile, { userEmail: 'u1@test.local', amount: 80 }),
    ]);

    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(await cash()).toBe(20);
    expect(await wallet(ids.u1)).toBe(920);
  });

  it('rolls back every balance change when a step inside the transaction fails', async () => {
    // Make the ledger insert (the last step) fail on a duplicate transactionId.
    await prisma.transaction.create({ data: { transactionId: 'DUP-REF', type: 'test', status: 'completed' } });
    jest.spyOn(service as any, 'generateReference').mockReturnValueOnce('DUP-REF');

    await expect(
      service.processCashIn(await agentProfile(), { userEmail: 'u1@test.local', amount: 100 }),
    ).rejects.toThrow();

    expect(await wallet(ids.u1)).toBe(1000);
    expect(await cash()).toBe(1000);
    expect(await wallet(ids.agentUser)).toBe(0);
    expect(await prisma.agentCashTransaction.count()).toBe(0);
  });
});
