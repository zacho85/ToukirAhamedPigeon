/**
 * Checks the M-Pesa Daraja integration against Safaricom's SANDBOX with the
 * credentials in .env, and prints what came back (never the secrets).
 *
 *   npx ts-node scripts/mpesa-sandbox-check.ts token
 *   npx ts-node scripts/mpesa-sandbox-check.ts stk <phone> <amountKES>
 *   npx ts-node scripts/mpesa-sandbox-check.ts register-c2b
 *   npx ts-node scripts/mpesa-sandbox-check.ts simulate-c2b <phone> <amountKES> <billRef>
 *
 * Sandbox test phone: 254708374149. Refuses to run against the live API.
 */
import 'dotenv/config';
import { ConfigService } from '@nestjs/config';
import { MpesaService } from '../src/mpesa/mpesa.service';

async function main() {
  const base = process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke';
  if (!base.includes('sandbox')) {
    throw new Error(`Refusing to run: MPESA_BASE_URL (${base}) is not the sandbox.`);
  }

  const mpesa = new MpesaService(new ConfigService(process.env));
  const [cmd, a, b, c] = process.argv.slice(2);

  switch (cmd) {
    case 'token': {
      const token = await mpesa.getAccessToken();
      console.log(`Token OK (${token.length} characters, starts ${token.slice(0, 4)}...)`);
      break;
    }
    case 'stk': {
      const res = await mpesa.requestToPay({
        amount: Number(b || 1),
        currency: 'KES',
        phoneNumber: a || '254708374149',
        externalId: `sandbox_check_${Date.now()}`,
        payerMessage: 'Sandbox check',
        payeeNote: 'Sandbox check',
      });
      console.log('STK push accepted. CheckoutRequestID:', res.referenceId);
      console.log('The result arrives at MPESA_CALLBACK_URL; to poll it instead:');
      console.log(await mpesa.getTransactionStatus(res.referenceId));
      break;
    }
    case 'register-c2b':
      console.log(await mpesa.registerC2BUrls());
      break;
    case 'simulate-c2b':
      console.log(await mpesa.simulateC2B(Number(b || 10), a || '254708374149', c || a || ''));
      break;
    default:
      console.log('Usage: token | stk <phone> <amount> | register-c2b | simulate-c2b <phone> <amount> <billRef>');
  }
}

main().catch((e) => {
  const body = e?.response?.data ? ` ${JSON.stringify(e.response.data)}` : '';
  console.error(`Failed: ${e.message}${body}`);
  process.exit(1);
});
