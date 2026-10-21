/**
 * Sandbox seed — fabricated data for the external-developer environment.
 *
 * NEVER run this against production, and never restore a production dump into
 * the sandbox database. Every person, phone number and address below is fake.
 *
 * Run:  npm run seed:sandbox
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/** Refuse to run anywhere that is not explicitly a sandbox. */
function assertSandbox() {
  if (process.env.APP_ENV !== 'sandbox') {
    throw new Error(
      'Refusing to seed: APP_ENV must be "sandbox". ' +
        'This script fabricates users and must never touch a real database.',
    );
  }
  const url = process.env.DATABASE_URL ?? '';
  if (!url.includes('sandbox')) {
    throw new Error(
      'Refusing to seed: DATABASE_URL does not look like a sandbox database ' +
        '(expected the name to contain "sandbox").',
    );
  }
}

/**
 * The permission vocabulary the React frontend actually gates on, expressed as
 * `action:resource`. Keep in sync with ProtectedRoute/SidebarMenu — an entry
 * missing here means the corresponding screen renders as "Unauthorized".
 */
const RESOURCES_CRUD = [
  'budget',
  'budget-category',
  'expense',
  'tontine',
  'user',
  'payment-link',
];

const READ_ONLY_RESOURCES = [
  'dashboard',
  'wallet',
  'history',
  'role',
  'backup',
  'agent-dashboard',
  'agent-crm',
  'fee-management',
  'crypto-exchange',
  'currency-exchange',
  'tontine-contribution',
  'tontine-invite',
];

function buildPermissionMatrix(): { action: string; resource: string }[] {
  const perms: { action: string; resource: string }[] = [];

  for (const resource of RESOURCES_CRUD) {
    for (const action of ['create', 'read', 'update', 'delete']) {
      perms.push({ action, resource });
    }
  }
  for (const resource of READ_ONLY_RESOURCES) {
    perms.push({ action: 'read', resource });
  }

  // Explicitly required by the app beyond plain CRUD.
  perms.push({ action: 'create', resource: 'send-money' });
  perms.push({ action: 'read', resource: 'send-money' });
  // Gate used by the API documentation permission check.
  perms.push({ action: 'view', resource: 'api-docs' });
  // agents.controller.ts guards approve/suspend/activate/commission with this,
  // but 'agent-crm' only being in READ_ONLY_RESOURCES above never created it --
  // those admin actions were unreachable by anyone until this was added.
  perms.push({ action: 'update', resource: 'agent-crm' });

  // De-duplicate on the composite unique key.
  const seen = new Set<string>();
  return perms.filter((p) => {
    const key = `${p.action}:${p.resource}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Permissions granted to an ordinary personal account. */
const PERSONAL_ALLOWED = new Set([
  'read:dashboard',
  'read:wallet',
  'read:history',
  'read:send-money',
  'create:send-money',
  'read:budget',
  'create:budget',
  'update:budget',
  'delete:budget',
  'read:budget-category',
  'create:budget-category',
  'update:budget-category',
  'read:expense',
  'create:expense',
  'read:tontine',
  'create:tontine',
  'update:tontine',
  'read:tontine-contribution',
  'read:tontine-invite',
  'read:payment-link',
  'create:payment-link',
  'read:currency-exchange',
]);

async function main() {
  assertSandbox();
  console.log('🌱 Seeding SANDBOX database…');

  // ---------------------------------------------------------------- roles
  const roleNames = ['admin', 'personal', 'merchant', 'user'];
  const roles: Record<string, { id: number }> = {};
  for (const name of roleNames) {
    roles[name] = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name, description: `${name} role (sandbox)` },
    });
  }
  console.log(`   roles: ${roleNames.join(', ')}`);

  // ---------------------------------------------------------- permissions
  const matrix = buildPermissionMatrix();
  const permissions: { id: number; action: string; resource: string }[] = [];
  for (const p of matrix) {
    const created = await prisma.permission.upsert({
      where: { action_resource: { action: p.action, resource: p.resource } },
      update: {},
      create: {
        action: p.action,
        resource: p.resource,
        name: `${p.action}_${p.resource}`.replace(/-/g, '_'),
        description: `${p.action} ${p.resource}`,
      },
    });
    permissions.push(created);
  }
  console.log(`   permissions: ${permissions.length}`);

  // ------------------------------------------------- role ↔ permission map
  for (const permission of permissions) {
    // admin gets everything
    await prisma.rolePermission.upsert({
      where: {
        role_permission_unique: {
          roleId: roles.admin.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: { roleId: roles.admin.id, permissionId: permission.id },
    });

    // personal / user get the everyday subset
    const key = `${permission.action}:${permission.resource}`;
    if (PERSONAL_ALLOWED.has(key)) {
      for (const roleName of ['personal', 'user']) {
        await prisma.rolePermission.upsert({
          where: {
            role_permission_unique: {
              roleId: roles[roleName].id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: { roleId: roles[roleName].id, permissionId: permission.id },
        });
      }
    }
  }
  console.log('   role→permission links done');

  // ---------------------------------------------------------------- users
  const devEmail = process.env.SANDBOX_DEV_EMAIL ?? 'mobile.dev@sandbox.kongossapay.com';
  const devPassword = process.env.SANDBOX_DEV_PASSWORD ?? 'SandboxDev!2026';
  const adminEmail = process.env.SANDBOX_ADMIN_EMAIL ?? 'admin@sandbox.kongossapay.com';
  const adminPassword = process.env.SANDBOX_ADMIN_PASSWORD ?? 'SandboxAdmin!2026';

  async function makeUser(opts: {
    email: string;
    password: string;
    fullName: string;
    role: string;
    phoneNumber: string;
    walletBalance?: number;
    currency?: string;
  }) {
    const passwordHash = await bcrypt.hash(opts.password, 12);
    return prisma.user.upsert({
      where: { email: opts.email },
      update: {
        passwordHash,
        role: opts.role,
        walletBalance: opts.walletBalance ?? 0,
      },
      create: {
        email: opts.email,
        passwordHash,
        fullName: opts.fullName,
        role: opts.role,
        phoneNumber: opts.phoneNumber,
        phoneVerified: true,
        emailVerifiedAt: new Date(),
        kycStatus: 'verified',
        approvalStatus: 'approved',
        status: 'active',
        accountType: 'personal',
        userType: 'personal',
        address: '1 Example Street, Sandbox',
        country: 'CM',
        dateOfBirth: new Date('1990-01-01'),
        currency: opts.currency ?? 'XAF',
        walletBalance: opts.walletBalance ?? 0,
      },
    });
  }

  const admin = await makeUser({
    email: adminEmail,
    password: adminPassword,
    fullName: 'Sandbox Admin',
    role: 'admin',
    phoneNumber: '+237600000001',
    walletBalance: 1_000_000,
  });

  const dev = await makeUser({
    email: devEmail,
    password: devPassword,
    fullName: 'Mobile Dev (Sandbox)',
    role: 'personal',
    phoneNumber: '+237600000002',
    walletBalance: 250_000,
  });

  const counterparties = [];
  const fakePeople = [
    ['ada.tester@sandbox.kongossapay.com', 'Ada Tester', '+237600000003'],
    ['blaise.sample@sandbox.kongossapay.com', 'Blaise Sample', '+237600000004'],
    ['chantal.demo@sandbox.kongossapay.com', 'Chantal Demo', '+237600000005'],
  ];
  for (const [email, fullName, phone] of fakePeople) {
    counterparties.push(
      await makeUser({
        email,
        password: 'SandboxUser!2026',
        fullName,
        role: 'personal',
        phoneNumber: phone,
        walletBalance: 75_000,
      }),
    );
  }
  console.log(`   users: ${2 + counterparties.length}`);

  // ------------------------------------------------------- role assignment
  for (const [user, roleName] of [
    [admin, 'admin'],
    [dev, 'personal'],
    ...counterparties.map((c) => [c, 'personal'] as const),
  ] as [{ id: number }, string][]) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: roles[roleName].id } },
      update: {},
      create: { userId: user.id, roleId: roles[roleName].id },
    });
  }

  // --------------------------------------------------------- transactions
  const existingTx = await prisma.transaction.count();
  if (existingTx === 0) {
    const types = ['wallet_topup', 'wallet_transfer', 'wallet_payout', 'payment_link'];
    for (let i = 0; i < 24; i++) {
      const type = types[i % types.length];
      const counterparty = counterparties[i % counterparties.length];
      await prisma.transaction.create({
        data: {
          transactionId: `SBX-${String(i + 1).padStart(5, '0')}`,
          senderId: type === 'wallet_topup' ? null : dev.id,
          recipientId: type === 'wallet_topup' ? dev.id : counterparty.id,
          amount: 5000 + i * 250,
          fee: 50,
          currency: 'XAF',
          type,
          status: i % 7 === 0 ? 'pending' : 'completed',
          description: `Sandbox ${type.replace('_', ' ')} #${i + 1}`,
          createdAt: new Date(Date.now() - i * 36e5 * 6),
        },
      });
    }
    console.log('   transactions: 24');
  } else {
    console.log(`   transactions: ${existingTx} already present, skipped`);
  }

  // -------------------------------------------------------------- tontine
  let tontine = await prisma.tontine.findFirst({ where: { name: 'Sandbox Savings Circle' } });
  if (!tontine) {
    tontine = await prisma.tontine.create({
      data: {
        name: 'Sandbox Savings Circle',
        type: 'friends',
        createdBy: dev.id,
        contributionAmount: 10_000,
        frequency: 'monthly',
        durationMonths: 6,
        status: 'active',
        maxMembers: 6,
        startDate: new Date(),
        totalPot: 30_000,
      },
    });

    let order = 1;
    for (const member of [dev, ...counterparties]) {
      const tm = await prisma.tontineMember.create({
        data: {
          tontineId: tontine.id,
          userId: member.id,
          priorityOrder: order,
          isAdmin: member.id === dev.id,
        },
      });
      await prisma.tontineContribution.create({
        data: {
          tontineMemberId: tm.id,
          userId: member.id,
          amount: 10_000,
          status: order <= 3 ? 'paid' : 'pending',
          roundNumber: 1,
          contributionDate: new Date(),
          paymentMethod: 'wallet',
        },
      });
      order++;
    }
    console.log('   tontine: 1 (with members + round-1 contributions)');
  } else {
    console.log('   tontine: already present, skipped');
  }

  // -------------------------------------------------------- account limits
  await prisma.transactionLimits.upsert({
    where: { userId: dev.id },
    update: {},
    create: {
      userId: dev.id,
      daily: 500_000,
      weeklyBudget: 1_000_000,
      monthlyBudget: 3_000_000,
      yearlyBudget: 12_000_000,
    },
  });

  console.log('\n✅ Sandbox seed complete.');
  console.log(`   admin : ${adminEmail}`);
  console.log(`   dev   : ${devEmail}`);
  console.log('   Passwords come from .env.sandbox. OTP codes arrive in Mailpit.');
}

main()
  .catch((e) => {
    console.error('❌ Sandbox seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
