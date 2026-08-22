# Sandbox API & documentation access

How the external Flutter developer gets a documented, callable API without any
path to production data.

- **Sandbox API + docs:** `https://sandbox-api.kongossapay.com`
- **Production API:** `https://api.kongossapay.com` — never shared, and it serves no docs.

---

## Part 1 — Operator runbook (Hetzner)

Everything runs on the existing box as a second compose project. Production
containers, volumes and network are untouched.

### 1. Configure the environment

```bash
cd /var/www/kongossa-pay
cp .env.sandbox.template .env.sandbox
```

Fill in `.env.sandbox`. Every secret **must differ from production** — that is
what makes a production token useless against sandbox and vice-versa:

```bash
openssl rand -hex 48   # SANDBOX_JWT_SECRET
openssl rand -hex 48   # SANDBOX_JWT_REFRESH_SECRET
```

Use Stripe **test-mode** keys only. Leave the other payment providers unset
unless they offer a real sandbox — an unset credential makes that provider fail
loudly, which is what we want here.

### 2. Bring the stack up

```bash
docker compose -p kongossa-sandbox -f docker-compose.sandbox.yml up -d --build
```

### 3. Create the schema and seed fake data

```bash
docker compose -p kongossa-sandbox -f docker-compose.sandbox.yml exec backend-sandbox npx prisma migrate deploy
```

```bash
docker compose -p kongossa-sandbox -f docker-compose.sandbox.yml exec backend-sandbox npm run seed:sandbox
```

The seed refuses to run unless `APP_ENV=sandbox` **and** `DATABASE_URL` contains
`sandbox`. Never restore a production dump into this database.

### 4. Create the documentation credentials

```bash
mkdir -p /var/www/kongossa-pay/nginx && htpasswd -c /var/www/kongossa-pay/nginx/.htpasswd-docs mobiledev
```

(Drop `-c` when adding a second user — it truncates the file.)

### 5. Issue the certificate and reload the proxy

```bash
certbot certonly --nginx -d sandbox-api.kongossapay.com
```

The nginx config currently points at the existing `kongossapay.com` certificate;
if you issue a dedicated cert, update the two `ssl_certificate*` lines in the
`sandbox-api` block of `kongossa-pay-ts/nginx.conf`.

Point `sandbox-api.kongossapay.com` at the server's IP in DNS, then redeploy the
frontend container so it picks up the new nginx config and joins the sandbox network.

> **Order matters.** The production stack now declares `kongossa-sandbox-network`
> as external. Bring the sandbox stack up first, or run
> `docker network create kongossa-sandbox-network`, otherwise the production
> stack will not start.

### Revoking access

```bash
htpasswd -D /var/www/kongossa-pay/nginx/.htpasswd-docs mobiledev && docker exec kongossa-frontend nginx -s reload
```

No redeploy, no code change. To cut off the API as well, stop the sandbox stack.

---

## Part 2 — What to send the developer

Send the URL and the credentials through **different channels**.

**Base URL** — use this for every request:

```
https://sandbox-api.kongossapay.com
```

**API documentation:** `https://sandbox-api.kongossapay.com/api-docs`
(the browser will prompt for a username and password).
Machine-readable spec: `https://sandbox-api.kongossapay.com/api-docs-json`.

**Generating a Dart client:**

```bash
openapi-generator generate -i https://sandbox-api.kongossapay.com/api-docs-json -g dart-dio -o ./lib/api
```

**Logging in.** Authentication is OTP-gated — three calls, and the token only
arrives at the last one:

1. `POST /auth/login` with `{ "identifier": "<email>", "password": "<password>" }`
2. `POST /auth/send-otp` with `{ "email": "<email>", "purpose": "login" }`
3. `POST /auth/verify-otp` with `{ "email": "<email>", "code": "<code>", "purpose": "login" }`
   → returns `accessToken` plus a `refreshToken` httpOnly cookie.

Send `Authorization: Bearer <accessToken>` on every subsequent request. When it
expires, `POST /auth/refresh-token` (the refresh cookie must be sent along).

**Reading OTP emails.** All sandbox mail is captured by Mailpit — no message
reaches a real inbox. Ask the operator to expose its web UI or to read the code
for you. Without this you cannot complete step 3.

**Seeded accounts** come from `.env.sandbox` (`SANDBOX_DEV_EMAIL`, `SANDBOX_ADMIN_EMAIL`).

### Ground rules

- This is a **sandbox**. Data may be wiped and reseeded at any time — never rely
  on a record persisting, and never treat it as a staging mirror of production.
- Payment providers are in **test mode**. Use Stripe's test cards. No real money moves.
- **Never load real customer data**, real card numbers, or real identity documents.
- If an endpoint is missing, undocumented, or returns something unexpected,
  **report it** rather than working around it — undocumented behaviour is
  usually a bug on our side, and workarounds tend to break at release.
- You will not receive production URLs, credentials, database access, or the
  repository. If you think you need one of those, ask.

---

## Design notes

**Why HTTP Basic auth rather than the app's own permission system.** A browser
cannot attach an `Authorization: Bearer` header to an address-bar navigation, so
the previous JWT-header gate on `/api-docs` could never work from a browser.
Basic auth is prompted natively by the browser, is enforced at the edge before
any request reaches Nest, and is revocable in one line.

**Two independent locks on production.** The backend refuses to mount Swagger
unless `ENABLE_SWAGGER=true` **and** `APP_ENV !== 'production'`; nginx separately
returns 404 for `/api-docs*` on `api.kongossapay.com`. A single misconfigured
environment variable is not enough to leak the spec.

**Why the sandbox upstream is a variable.** nginx resolves a literal `proxy_pass`
hostname at startup. Had the sandbox host been written literally, the sandbox
stack being down would stop nginx from booting — taking production offline.
With `set $sandbox_backend …` resolution is deferred to request time, so a dead
sandbox produces a 502 on that vhost only.
