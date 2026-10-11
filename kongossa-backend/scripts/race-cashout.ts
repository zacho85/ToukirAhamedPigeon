/**
 * Fires several cash-out requests for AG1 at the same moment, to check that
 * concurrent requests can never take cash on hand or a wallet below zero.
 * Manual test helper for TC-1-06 / TC-1-07. Development only.
 *
 *   npx ts-node scripts/race-cashout.ts --user U1 --amount 80 --count 2
 *
 * Needs the backend (localhost:3000) and the mail catcher (localhost:8025)
 * running, and AG1's day already started. Keep the amount at or below the
 * cash-out OTP threshold so each request completes on its own.
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { ACCOUNT_EMAILS, AccountKey, TEST_PASSWORD } from './m3-test-accounts';

const API = process.env.M3_API_URL || 'http://127.0.0.1:3000';
const MAIL = process.env.M3_MAIL_URL || 'http://127.0.0.1:8025';

function arg(name: string, fallback: string): string {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

async function post(path: string, body: unknown, token?: string) {
  const res = await fetch(API + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  return { status: res.status, json: (await res.json().catch(() => null)) as any };
}

async function latestMailId(email: string): Promise<number> {
  const res = await fetch(`${MAIL}/api/latest?to=${encodeURIComponent(email)}`);
  return res.ok ? ((await res.json()) as any).id : 0;
}

/** Logs in through the normal email-OTP flow, reading the code from the mail catcher. */
async function login(email: string): Promise<string> {
  const before = await latestMailId(email);
  const r = await post('/auth/login', { identifier: email, password: TEST_PASSWORD });
  if (!r.json?.otp_required) throw new Error(`Login failed for ${email}: ${JSON.stringify(r.json)}`);

  for (let i = 0; i < 40; i++) {
    const res = await fetch(`${MAIL}/api/latest?to=${encodeURIComponent(email)}`);
    const mail = res.ok ? ((await res.json()) as any) : null;
    if (mail && mail.id > before && mail.otp) {
      const v = await post('/auth/verify-otp', { email, code: mail.otp, purpose: 'login' });
      if (!v.json?.accessToken) throw new Error(`OTP verification failed: ${JSON.stringify(v.json)}`);
      return v.json.accessToken;
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`No login OTP arrived for ${email}. Is the mail catcher running?`);
}

async function main() {
  const userKey = arg('user', 'U1').toUpperCase() as AccountKey;
  const amount = Number(arg('amount', '80'));
  const count = Number(arg('count', '2'));
  const userEmail = ACCOUNT_EMAILS[userKey];
  if (!userEmail) throw new Error(`Unknown --user ${userKey}`);

  const prisma = new PrismaClient();
  const agent = await prisma.agentProfile.findFirstOrThrow({ where: { user: { email: ACCOUNT_EMAILS.AG1 } } });
  const before = {
    cashOnHand: Number(agent.cashOnHand),
    wallet: (await prisma.user.findUniqueOrThrow({ where: { email: userEmail } })).walletBalance,
  };

  const token = await login(ACCOUNT_EMAILS.AG1);
  console.log(`Before: AG1 cash on hand ${before.cashOnHand.toFixed(2)}, ${userKey} wallet ${before.wallet.toFixed(2)}`);
  console.log(`Sending ${count} cash-outs of ${amount.toFixed(2)} from ${userKey} at the same time...\n`);

  const results = await Promise.all(
    Array.from({ length: count }, () => post('/agents/cash-out', { userEmail, amount }, token)),
  );
  results.forEach((r, i) =>
    console.log(`  request ${i + 1}: ${r.status} ${r.status < 300 ? `OK (${r.json?.data?.status})` : r.json?.message}`),
  );

  const after = {
    cashOnHand: Number((await prisma.agentProfile.findUniqueOrThrow({ where: { id: agent.id } })).cashOnHand),
    wallet: (await prisma.user.findUniqueOrThrow({ where: { email: userEmail } })).walletBalance,
  };
  const succeeded = results.filter((r) => r.status < 300).length;
  console.log(`\nAfter:  AG1 cash on hand ${after.cashOnHand.toFixed(2)}, ${userKey} wallet ${after.wallet.toFixed(2)}`);
  console.log(`${succeeded} of ${count} succeeded; wallet moved by ${(before.wallet - after.wallet).toFixed(2)}, cash on hand by ${(before.cashOnHand - after.cashOnHand).toFixed(2)}.`);
  if (after.cashOnHand < 0 || after.wallet < 0) console.log('PROBLEM: a balance went negative.');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
