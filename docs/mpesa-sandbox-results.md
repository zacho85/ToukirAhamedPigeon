# M-Pesa (Daraja): sandbox status and what production needs

Last updated: 11 October 2026.

## Flows

| Flow | What it does | Tested locally | Tested against Daraja sandbox | Needed for production |
|---|---|---|---|---|
| Access token | `GET /oauth/v1/generate` with the consumer key and secret | Script runs; stops with a clear message when keys are missing | **Not yet: waiting for sandbox credentials** | Production app keys after Safaricom Go-Live |
| STK Push (Lipa Na M-Pesa Online) | Customer approves a wallet top-up on their phone | Request code unchanged | **Not yet** | Go-Live approval, production shortcode and passkey, public HTTPS callback URL |
| STK callback | `POST /wallet-topup/mpesa/webhook` settles the top-up | Yes: simulated callbacks. Success credits once (3 parallel callbacks → 1 credit), failure marks failed, wrong amount is not credited | **Not yet** | Same URL on the production domain |
| STK status query | Poll when no callback arrived | Yes: returns the stored result first | **Not yet** | Same keys as STK Push |
| C2B register URLs | Tells Safaricom where to send paybill payments | Script ready (`register-c2b`) | **Not yet** | Production paybill/till number, then register once |
| C2B validation | `POST /wallet-topup/mpesa/c2b/validation`: accept only a known, active customer's phone number as the account number | Yes: known number accepted, unknown or suspended rejected (`C2B00012`) | **Not yet** | External validation must be enabled by Safaricom on the shortcode |
| C2B confirmation | `POST /wallet-topup/mpesa/c2b/confirmation` credits the wallet | Yes: credited once per `TransID`; unknown account acknowledged but not credited | **Not yet** (sandbox `simulate-c2b` ready) | Same URL on the production domain |

## How to run the sandbox checks once credentials arrive

1. Put the sandbox values in `kongossa-backend/.env` (never commit them): `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_PASSKEY`, `MPESA_SHORTCODE`, `MPESA_CALLBACK_URL`, and for C2B `MPESA_C2B_SHORTCODE` and `MPESA_C2B_BASE_URL`. The keys are listed in `.env.sandbox.template`.
2. Expose the API on a public HTTPS URL (for example the sandbox server, or an ngrok tunnel to `localhost:3000`).
3. Run, from `kongossa-backend`:

```bash
npx ts-node scripts/mpesa-sandbox-check.ts token
npx ts-node scripts/mpesa-sandbox-check.ts stk 254708374149 10
npx ts-node scripts/mpesa-sandbox-check.ts register-c2b
npx ts-node scripts/mpesa-sandbox-check.ts simulate-c2b 254708374149 10 <customer phone>
```

The script refuses to run unless `MPESA_BASE_URL` is the sandbox.

## Notes

- Daraja charges in KES. Top-ups are recorded in KES and credited in USD at the stored `USD→KES` rate. Frankfurter does not publish KES, so a default rate (129) is seeded; an admin should set the current rate.
- Safaricom callbacks are not signed. A success callback is only credited when its amount matches the top-up. Restricting the callback URLs to Safaricom's IP addresses is recommended for production.
- Not built in this milestone: retry queue, scheduled status recovery and reconciliation of unmatched C2B payments.
