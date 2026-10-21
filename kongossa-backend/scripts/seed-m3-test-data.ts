/**
 * Milestone 3 manual-test seed: a known starting state for the agent
 * cash-in / cash-out / settlement test cases.
 *
 * Every run puts the test accounts back to the same state: balances, agent
 * limits and commission are reset, and their cash transactions, day
 * settlements, ledger rows and OTPs are deleted. Nothing else is touched.
 *
 * It refuses to run unless the database name contains "m3" or "test", so it
 * can never be pointed at a real database by accident.
 *
 * Run:  npx ts-node scripts/seed-m3-test-data.ts
 *
 * All accounts use the .test domain (reserved, never deliverable). OTP emails
 * are read in the local mail catcher: node scripts/dev-mail-catcher.js
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ACCOUNT_EMAILS as E, TEST_PASSWORD } from './m3-test-accounts';

const prisma = new PrismaClient();

function assertTestDatabase() {
  const url = process.env.DATABASE_URL ?? '';
  const dbName = url.split('/').pop()?.split('?')[0] ?? '';
  if (!/m3|test/i.test(dbName)) {
    throw new Error(
      `Refusing to seed: database "${dbName}" does not look like a test database ` +
        '(its name must contain "m3" or "test").',
    );
  }
}

// Same permission vocabulary as prisma/seed.sandbox.ts, plus update:agent-crm.
const RESOURCES_CRUD = ['budget', 'budget-category', 'expense', 'tontine', 'user', 'payment-link'];
const READ_ONLY_RESOURCES = [
  'dashboard', 'wallet', 'history', 'role', 'backup', 'agent-dashboard', 'agent-crm',
  'fee-management', 'crypto-exchange', 'currency-exchange', 'tontine-contribution', 'tontine-invite',
];
const EXTRA = [
  'create:send-money', 'read:send-money', 'view:api-docs', 'update:agent-crm',
  'update:fee-management', 'update:currency-exchange',
];

const PERSONAL_ALLOWED = [
  'read:dashboard', 'read:wallet', 'read:history', 'read:send-money', 'create:send-money',
  'read:budget', 'create:budget', 'update:budget', 'delete:budget',
  'read:budget-category', 'create:budget-category', 'update:budget-category',
  'read:expense', 'create:expense', 'read:tontine', 'create:tontine', 'update:tontine',
  'read:tontine-contribution', 'read:tontine-invite', 'read:payment-link', 'create:payment-link',
  'read:currency-exchange',
];
// For TC-6-10: can see Agent CRM but not change anything.
const VIEWER_ALLOWED = ['read:dashboard', 'read:agent-dashboard', 'read:agent-crm'];

function permissionKeys(): string[] {
  const keys = new Set<string>(EXTRA);
  for (const r of RESOURCES_CRUD) for (const a of ['create', 'read', 'update', 'delete']) keys.add(`${a}:${r}`);
  for (const r of READ_ONLY_RESOURCES) keys.add(`read:${r}`);
  return [...keys];
}

type UserSpec = {
  key: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  roles: string[];
  walletBalance: number;
  status?: string;
  userType?: string;
};

type AgentSpec = {
  userKey: string;
  agentCode: string;
  status: 'active' | 'pending';
  kycStatus: 'verified' | 'submitted';
  commissionRate: number;
};

const USERS: UserSpec[] = [
  { key: 'ADMIN', email: E.ADMIN, fullName: 'M3 Admin', phoneNumber: '+254700000100', role: 'admin', roles: ['admin'], walletBalance: 0 },
  { key: 'VIEWER', email: E.VIEWER, fullName: 'M3 Read-only Staff', phoneNumber: '+254700000101', role: 'staff', roles: ['agent-crm-viewer'], walletBalance: 0 },
  { key: 'AG1', email: E.AG1, fullName: 'Agent One', phoneNumber: '+254700000201', role: 'agent', roles: ['agent'], walletBalance: 0, userType: 'agent' },
  { key: 'AG2', email: E.AG2, fullName: 'Agent Two (pending)', phoneNumber: '+254700000202', role: 'pending', roles: [], walletBalance: 0, userType: 'agent' },
  { key: 'AG3', email: E.AG3, fullName: 'Agent Three', phoneNumber: '+254700000203', role: 'agent', roles: ['agent'], walletBalance: 0, userType: 'agent' },
  { key: 'U1', email: E.U1, fullName: 'User One', phoneNumber: '+254700000001', role: 'personal', roles: ['personal'], walletBalance: 1000 },
  { key: 'U2', email: E.U2, fullName: 'User Two', phoneNumber: '+254700000002', role: 'personal', roles: ['personal'], walletBalance: 50 },
  { key: 'U3', email: E.U3, fullName: 'User Three (suspended)', phoneNumber: '+254700000003', role: 'personal', roles: ['personal'], walletBalance: 100, status: 'suspended' },
];

const AGENTS: AgentSpec[] = [
  { userKey: 'AG1', agentCode: 'AG-M3-0001', status: 'active', kycStatus: 'verified', commissionRate: 2 },
  { userKey: 'AG2', agentCode: 'AG-M3-0002', status: 'pending', kycStatus: 'submitted', commissionRate: 0 },
  { userKey: 'AG3', agentCode: 'AG-M3-0003', status: 'active', kycStatus: 'verified', commissionRate: 1 },
];

async function main() {
  assertTestDatabase();
  console.log('Seeding Milestone 3 test data...');

  // ------------------------------------------------------ roles + permissions
  const roleIds: Record<string, number> = {};
  for (const name of ['admin', 'personal', 'merchant', 'user', 'agent', 'agent-crm-viewer']) {
    const role = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name, description: `${name} role` },
    });
    roleIds[name] = role.id;
  }

  const permIds: Record<string, number> = {};
  for (const key of permissionKeys()) {
    const [action, resource] = key.split(':');
    const p = await prisma.permission.upsert({
      where: { action_resource: { action, resource } },
      update: {},
      create: { action, resource, name: `${action}_${resource}`.replace(/-/g, '_'), description: `${action} ${resource}` },
    });
    permIds[key] = p.id;
  }

  const grants: [string, string[]][] = [
    ['admin', Object.keys(permIds)],
    ['personal', PERSONAL_ALLOWED],
    ['user', PERSONAL_ALLOWED],
    ['agent', PERSONAL_ALLOWED],
    ['agent-crm-viewer', VIEWER_ALLOWED],
  ];
  for (const [roleName, keys] of grants) {
    for (const key of keys) {
      await prisma.rolePermission.upsert({
        where: { role_permission_unique: { roleId: roleIds[roleName], permissionId: permIds[key] } },
        update: {},
        create: { roleId: roleIds[roleName], permissionId: permIds[key] },
      });
    }
  }

  // -------------------------------------------------------------------- users
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);
  const userIds: Record<string, number> = {};
  for (const u of USERS) {
    const data = {
      fullName: u.fullName,
      phoneNumber: u.phoneNumber,
      passwordHash,
      role: u.role,
      walletBalance: u.walletBalance,
      currency: 'USD',
      status: u.status ?? 'active',
      userType: u.userType ?? 'personal',
      accountType: 'personal',
      phoneVerified: true,
      emailVerifiedAt: new Date(),
      kycStatus: 'verified',
      approvalStatus: u.key === 'AG2' ? 'pending' : 'approved',
      agentStatus: u.key === 'AG2' ? 'pending' : u.userType === 'agent' ? 'active' : null,
    };
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: data,
      create: {
        ...data,
        email: u.email,
        address: '1 Test Street, Nairobi',
        country: 'KE',
        dateOfBirth: new Date('1990-01-01'),
      },
    });
    userIds[u.key] = user.id;

    await prisma.userRole.deleteMany({ where: { userId: user.id } });
    for (const r of u.roles) {
      await prisma.userRole.create({ data: { userId: user.id, roleId: roleIds[r] } });
    }
  }
  const ids = Object.values(userIds);

  // ------------------------------------------------- wipe previous test state
  const agentProfiles = await prisma.agentProfile.findMany({ where: { userId: { in: ids } }, select: { id: true } });
  const agentIds = agentProfiles.map((a) => a.id);
  await prisma.agentWalletAdjustment.deleteMany({ where: { agentId: { in: agentIds } } });
  await prisma.agentCashTransaction.deleteMany({ where: { OR: [{ agentId: { in: agentIds } }, { userId: { in: ids } }] } });
  await prisma.agentDaySettlement.deleteMany({ where: { agentId: { in: agentIds } } });
  await prisma.transaction.deleteMany({ where: { OR: [{ senderId: { in: ids } }, { recipientId: { in: ids } }] } });
  await prisma.otp.deleteMany({ where: { email: { in: USERS.map((u) => u.email) } } });
  // Platform fees back to their defaults, and the platform account to zero.
  await prisma.systemSettings.deleteMany({});
  await prisma.user.updateMany({ where: { email: 'platform@kongossapay.system' }, data: { walletBalance: 0 } });

  // ------------------------------------------------------------------- agents
  for (const a of AGENTS) {
    const agentData = {
      agentCode: a.agentCode,
      agentType: 'individual',
      status: a.status,
      kycStatus: a.kycStatus,
      kycSubmittedAt: new Date(),
      kycVerifiedAt: a.kycStatus === 'verified' ? new Date() : null,
      approvedAt: a.status === 'active' ? new Date() : null,
      approvedBy: a.status === 'active' ? userIds.ADMIN : null,
      idType: 'national_id',
      idNumber: `M3-${a.agentCode}`,
      commissionRate: a.commissionRate,
      cashOnHand: 0,
      maxCashOnHand: 5000,
      dailyTransactionLimit: 10000,
      monthlyTransactionLimit: 100000,
      maxTransactionAmount: 5000,
    };
    await prisma.agentProfile.upsert({
      where: { userId: userIds[a.userKey] },
      update: agentData,
      create: { ...agentData, userId: userIds[a.userKey] },
    });
  }

  console.log('\nDone. Test accounts (all share TEST_PASSWORD from scripts/m3-test-accounts.ts):');
  console.table(
    USERS.map((u) => ({
      key: u.key,
      email: u.email,
      wallet: u.walletBalance,
      note:
        AGENTS.find((a) => a.userKey === u.key)
          ? `${AGENTS.find((a) => a.userKey === u.key)!.status} agent, commission ${AGENTS.find((a) => a.userKey === u.key)!.commissionRate}%`
          : u.status === 'suspended' ? 'suspended' : u.role,
    })),
  );
  console.log('OTP codes: http://localhost:8025 (node scripts/dev-mail-catcher.js)');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
