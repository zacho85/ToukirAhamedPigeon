# Sandbox API & documentation access

How the external Flutter developer gets a documented, callable API with no path
to production data.

- **Sandbox API + docs + mailbox:** `https://sandbox-api.kongossapay.com`
- **Production API:** `https://api.kongossapay.com` — never shared, serves no docs.

---

## Part 1 — Operator runbook (Hetzner)

Written against the **actual** state of this server, which differs from the repo:

- `docker-compose.prod.yml` on the server is **locally modified and not in sync with git**:
  the backend runs `image: kongossa-backend-local` (built on the host from `./dist`
  via `Dockerfile.local`), and the frontend runs a pinned `ghcr.io/zacho85/kongossa-frontend`
  image. Never `git checkout` over it — edit it in place.
- The frontend's nginx config is **baked into that GHCR image**, so a vhost change
  would normally require rebuilding and pushing a new image. Step 5 replaces it with
  a host mount, after which config changes are just an edit plus a reload.
- Three containers run: frontend, backend, postgres. There is no mail container in
  production — production mail goes out through external SMTP.

### Prerequisites (before touching the server)

1. **DNS**: an `A` record for `sandbox-api.kongossapay.com` pointing at the server IP.
   Certificate issuance fails without it. Verify: `dig +short sandbox-api.kongossapay.com`
2. **Stripe test-mode keys** (secret, publishable, webhook signing secret).
3. A maintenance window of roughly **two minutes** — steps 6 and 7 briefly restart
   the frontend container.

### 1. Fetch the sandbox files onto the server

The server stays on `main`. Take only the sandbox paths from the branch, so the
locally-modified production compose is left alone:

```bash
cd /var/www/kongossa-pay && git fetch origin feature/sandbox-api-docs && git checkout origin/feature/sandbox-api-docs -- docker-compose.sandbox.yml .env.sandbox.template kongossa-backend/prisma/seed.sandbox.ts kongossa-backend/Dockerfile.prod kongossa-backend/.dockerignore kongossa-pay-ts/nginx.conf docs/sandbox-api-access.md && git status --short
```

> `kongossa-pay-ts/nginx.conf` previously carried git's `assume-unchanged` flag on
> this server. If the checkout above reports nothing for it, clear the flag first:
> `git update-index --no-assume-unchanged kongossa-pay-ts/nginx.conf`

### 2. Configure the sandbox environment

```bash
cd /var/www/kongossa-pay && cp .env.sandbox.template .env.sandbox && openssl rand -hex 48 && openssl rand -hex 48
```

Edit `.env.sandbox` and fill in every placeholder. The two generated strings above
are for `SANDBOX_JWT_SECRET` and `SANDBOX_JWT_REFRESH_SECRET` — they **must differ
from production**, that is what makes a production token useless here and vice-versa.
Use Stripe **test-mode** keys only. Leave the other payment providers unset.

### 3. Start the sandbox stack

Builds from source inside Docker using `Dockerfile.prod` (whose `CMD` is now fixed —
it previously pointed at a path the build never produced, which is why production
carries a `command:` override).

> **`--env-file` is required on every sandbox compose command.** `env_file:` inside
> the compose file only passes variables *into* the containers; the `${SANDBOX_…}`
> placeholders in the compose file itself are resolved at parse time and need
> `--env-file`. Without it, compose warns "variable is not set" and the database
> comes up with a blank user and password.

```bash
cd /var/www/kongossa-pay && docker compose -p kongossa-sandbox --env-file .env.sandbox -f docker-compose.sandbox.yml up -d --build && docker ps --format 'table {{.Names}}\t{{.Status}}'
```

### 4. Create the schema and seed fake data

```bash
cd /var/www/kongossa-pay && docker compose -p kongossa-sandbox --env-file .env.sandbox -f docker-compose.sandbox.yml exec backend-sandbox npx prisma migrate deploy
```

```bash
cd /var/www/kongossa-pay && docker compose -p kongossa-sandbox --env-file .env.sandbox -f docker-compose.sandbox.yml exec backend-sandbox npm run seed:sandbox
```

The seed refuses to run unless `APP_ENV=sandbox` **and** `DATABASE_URL` contains
`sandbox`. Never restore a production dump into this database.

### 5. Wire the reverse proxy to the sandbox

Create the documentation password (this is what the developer will be given):

```bash
mkdir -p /var/www/kongossa-pay/nginx && htpasswd -c /var/www/kongossa-pay/nginx/.htpasswd-docs mobiledev
```

Then edit `/var/www/kongossa-pay/docker-compose.prod.yml` **by hand** and add to the
`frontend` service, plus the network declaration at the bottom:

```yaml
  frontend:
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - ./kongossa-backend/uploads:/backend-uploads:ro
      - ./nginx/.htpasswd-docs:/etc/nginx/.htpasswd-docs:ro
      - ./kongossa-pay-ts/nginx.conf:/etc/nginx/conf.d/default.conf:ro
    networks:
      - kongossa-network
      - kongossa-sandbox-network

networks:
  kongossa-network:
    driver: bridge
  kongossa-sandbox-network:
    external: true
    name: kongossa-sandbox-network
```

Only the reverse proxy joins both networks. The production backend and database
never see the sandbox network.

### 6. Issue the certificate

The frontend container holds ports 80 and 443, so certbot needs them free for a
moment. This expands the existing certificate rather than creating a new one, so
the `ssl_certificate` paths in nginx stay unchanged.

```bash
docker stop kongossa-frontend && certbot certonly --standalone --expand -d kongossapay.com -d www.kongossapay.com -d api.kongossapay.com -d sandbox-api.kongossapay.com && docker start kongossa-frontend
```

> Roughly 30–60 seconds of downtime on the main site. If that is unacceptable, use a
> DNS-01 challenge instead and skip the stop/start.

### 7. Apply the proxy changes

```bash
cd /var/www/kongossa-pay && docker compose -f docker-compose.prod.yml up -d --no-deps --force-recreate frontend && sleep 5 && docker exec kongossa-frontend nginx -t && docker ps --format 'table {{.Names}}\t{{.Status}}'
```

`nginx -t` must report the config is OK. After this, any further nginx change is just
an edit to `kongossa-pay-ts/nginx.conf` plus:

```bash
docker exec kongossa-frontend nginx -s reload
```

### 8. Verify

```bash
echo "docs (no password, expect 401): $(curl -s -o /dev/null -w '%{http_code}' https://sandbox-api.kongossapay.com/api-docs)"; echo "docs (with password, expect 200): $(curl -s -o /dev/null -w '%{http_code}' -u mobiledev https://sandbox-api.kongossapay.com/api-docs)"; echo "prod docs (expect 404): $(curl -s -o /dev/null -w '%{http_code}' https://api.kongossapay.com/api-docs-json)"; echo "prod API alive (expect 401): $(curl -s -o /dev/null -w '%{http_code}' https://api.kongossapay.com/roles)"
```

**Isolation proof — do not skip.** The two counts must differ; sandbox should match
the seed, not production:

```bash
echo -n "sandbox users: " && docker exec kongossa-postgres-sandbox psql -U "$(grep SANDBOX_DB_USER /var/www/kongossa-pay/.env.sandbox | cut -d= -f2)" -d kongossa_sandbox_db -t -c 'select count(*) from "User";' && echo -n "production users: " && docker exec kongossa-postgres psql -U postgres -d kongossa_db -t -c 'select count(*) from "User";'
```

```bash
docker inspect kongossa-backend-sandbox --format '{{range .Mounts}}{{.Source}} -> {{.Destination}}{{"\n"}}{{end}}'
```

No `docker.sock`, and no production uploads path, must appear in that mount list.

**Cross-environment token rejection**: log in on production, take the access token,
call a sandbox endpoint with it — expect 401. That proves the JWT secrets really differ.

### Revoking access

```bash
htpasswd -D /var/www/kongossa-pay/nginx/.htpasswd-docs mobiledev && docker exec kongossa-frontend nginx -s reload
```

To cut the API off as well:

```bash
docker compose -p kongossa-sandbox -f /var/www/kongossa-pay/docker-compose.sandbox.yml stop
```

---

## Part 2 — What to send the developer

Send the URL and the credentials through **different channels**.

**Base URL** — use this for every request:

```
https://sandbox-api.kongossapay.com
```

**API documentation:** `https://sandbox-api.kongossapay.com/api-docs`
(the browser will prompt for a username and password).
Machine-readable spec: `https://sandbox-api.kongossapay.com/api-docs-json`

**Your mailbox:** `https://sandbox-api.kongossapay.com/mailpit/` — same credentials.
Every email the sandbox sends lands here and nowhere else.

**Generating a Dart client:**

```bash
openapi-generator generate -i https://sandbox-api.kongossapay.com/api-docs-json -g dart-dio -o ./lib/api
```

**Logging in.** Authentication is OTP-gated — three calls, and the token only arrives
at the last one:

1. `POST /auth/login` with `{ "identifier": "<email>", "password": "<password>" }`
2. `POST /auth/send-otp` with `{ "email": "<email>", "purpose": "login" }`
3. Read the code in Mailpit, then `POST /auth/verify-otp` with
   `{ "email": "<email>", "code": "<code>", "purpose": "login" }`
   → returns `accessToken`, plus a `refreshToken` httpOnly cookie.

Send `Authorization: Bearer <accessToken>` on every subsequent request. When it
expires, `POST /auth/refresh-token` (the refresh cookie must be sent along).

**Seeded accounts** are in `.env.sandbox` (`SANDBOX_DEV_EMAIL`, `SANDBOX_ADMIN_EMAIL`).

### Ground rules

- This is a **sandbox**. Data may be wiped and reseeded at any time — never rely on a
  record persisting, and do not treat it as a mirror of production.
- Payment providers are in **test mode**. Use Stripe's test cards. No real money moves.
- **Never load real customer data**, real card numbers, or real identity documents.
- If an endpoint is missing, undocumented, or behaves unexpectedly, **report it**
  rather than working around it — undocumented behaviour is usually a bug on our
  side, and workarounds tend to break at release.
- You will not receive production URLs, credentials, database access, or the source
  repository. If you think you need one of those, ask.

---

## Design notes

**Why HTTP Basic auth rather than the app's own permission system.** A browser cannot
attach an `Authorization: Bearer` header to an address-bar navigation, so the previous
JWT-header gate on `/api-docs` could never work from a browser. Basic auth is prompted
natively, enforced at the edge before any request reaches Nest, and revocable in one line.

**Two independent locks on production.** The backend refuses to mount Swagger unless
`ENABLE_SWAGGER=true` **and** `APP_ENV != 'production'`; nginx separately returns 404
for `/api-docs*` on `api.kongossapay.com`. One stray environment variable is not enough
to leak the spec.

**Why the sandbox upstream is a variable.** nginx resolves a literal `proxy_pass`
hostname at startup. Written literally, the sandbox stack being down would stop nginx
from booting — taking production offline with it. With `set $sandbox_backend …`
resolution is deferred to request time, so a dead sandbox yields a 502 on that vhost only.
