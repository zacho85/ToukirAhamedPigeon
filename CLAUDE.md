# Kongossa Pay — Project Guide for Claude

Kongossa Pay is a fintech platform for African markets: multi-currency wallets, QR payments,
peer transfers, merchant payment links, budgeting, and **tontines** (rotating savings groups),
plus a human **agent** network for cash-in/cash-out. Production domain: `kongossapay.com`.

## Repo map

`C:\laragon\www\kongossa_pay` is a **single git repo** (branch `main`) containing multiple apps —
`git rev-parse --show-toplevel` from any subfolder returns the parent. Do not treat these as separate repos.

| Folder | Stack | Role |
|---|---|---|
| `kongossa-backend` | NestJS 11, TypeScript, Prisma 6, PostgreSQL | The API. Serves both frontends. |
| `kongossa-pay-ts` | React 19, Vite 7, TS, Tailwind 4, shadcn/ui, Redux Toolkit, react-router 7, PWA | Main web app (user + admin). |
| `kongossa-agent-app` | separate app | Agent-facing app. Out of scope for this guide. |

CI: `.github/workflows/deploy.yml` builds Docker images to ghcr.io and deploys to Hetzner over SSH,
taking a database backup first. Compose file: `docker-compose.prod.yml` (postgres + backend + frontend).

## Commands

Backend (`kongossa-backend/`):

```bash
npm run start:dev
```

`npm run build` · `npm run start:prod` · `npm run lint` (eslint --fix) · `npm run format` (prettier).
API listens on **port 3000**.

Prisma:

```bash
npx prisma migrate dev
```

`npx prisma generate` · `npx prisma studio` · `npm run seed` (`prisma/seed.ts` — roles + one
`read:dashboard` permission only) · `npm run seed:sandbox` (`prisma/seed.sandbox.ts` — full fake dataset,
refuses to run unless `APP_ENV=sandbox` and the database name contains `sandbox`).

Sandbox stack and API docs for external developers: see [docs/sandbox-api-access.md](docs/sandbox-api-access.md).

Frontend (`kongossa-pay-ts/`):

```bash
npm run dev
```

`npm run build` · `npm run type-check` (tsc --noEmit) · `npm run lint`. Dev server on **port 5173**, opens automatically.

**There is no meaningful test suite.** The backend has zero `*.spec.ts` files under `src/` and only the
untouched default `test/app.e2e-spec.ts`; `npm test` / `npm run test:e2e` exist but cover nothing.
The frontend has no test runner installed at all. Verify changes by running the apps, not by running tests.

## Backend architecture

Flat feature-module layout — 48 module files, of which 42 are registered in `src/app.module.ts`
(see Known issues #3 — the other five are dead code):

```
src/<feature>/
  <feature>.controller.ts
  <feature>.service.ts
  <feature>.module.ts
  dto/*.dto.ts
```

**Request flow: Controller → Service → `PrismaService`.** Services call `this.prisma.<model>` directly.
There is **no repository layer** — do not add one, and do not invent an abstraction that siblings lack.

Global wiring lives in `src/main.ts`:

- `ValidationPipe({ whitelist: true, transform: true })` — DTOs are enforced globally.
- `HttpExceptionFilter` (`src/common/filters/`) — normalizes every error to `{ statusCode, timestamp, path, message }`.
- `LoggingInterceptor` (`src/common/interceptors/`), `cookie-parser`, CORS allowlist, static `/uploads`, 100mb body limit.
- **Stripe raw-body middleware is mounted BEFORE body-parser** for `/stripe/webhook` and
  `/stripe/payment-links/webhook`. Never reorder those lines — signature verification breaks.

Payment providers each get a thin 3-file module wrapping the vendor HTTP API with `axios`
(controller + service + module, no DTO folder): `stripe`, `momo` (MTN), `orange-money`, `mpesa`,
`paystack`, `flutterwave`, `airtel-money`, `transfi`. Follow that shape for a new provider.

Domain modules: `tontines` (+ `tontine-members`, `tontine-contributions`, `tontine-invites`),
`budgets` / `budget-categories` / `expenses`, `wallet-topup` / `wallet-payout`, `payment-links`,
`qr-payments`, `remittances`, `float-requests`, `agents`, `transactions`, `support-tickets`,
`backup` (shells out to `pg_dump`), `exchange-rate`, `dashboard`.

Shared helpers: `src/common/utils/pagination.ts`, `src/common/utils/decimal.util.ts` (`toNumber`),
`src/constants/currencies.ts`.

## Auth & authorization

- Access token: JWT in `Authorization: Bearer`. Refresh token: **httpOnly cookie** `refreshToken`,
  stored bcrypt-hashed in the `RefreshToken` table and rotated on use.
- Login is **OTP-gated**: `POST /auth/login` → `POST /auth/send-otp` → `POST /auth/verify-otp`.
  Tokens are only issued at the last step (`AuthService.generateTokensAfterOtp`).
- `JwtStrategy.validate()` returns **`{ userId, email, role }`** — there is no `id` and no `sub` on `req.user`.
  Always read `req.user.userId`. (See Known issues #1 — several existing call sites get this wrong.)
- Passwords: bcryptjs, cost 12.

**Authentication is global and closed by default.** `JwtAuthGuard` is registered as an `APP_GUARD` in
`app.module.ts`, so *every* route requires a valid token unless it opts out with `@Public()`
(`src/auth/decorators/public.decorator.ts`). When adding a genuinely public route — a provider webhook,
a pre-login auth step, a public payment page — mark it `@Public()` and say why in a comment. A webhook
marked `@Public()` must verify the provider's signature; that is its authentication.

### ⚠️ Two role systems coexist — know which one you are touching

1. **`User.role`** — a plain string column, carried in the JWT payload as the `role` claim.
2. **`Role` / `UserRole`** — role rows assigned per user through the admin UI.
3. **`Permission` / `RolePermission` tables** — the dynamic permission layer on top. `Permission`
   has `action` + `resource` columns; `auth.service.ts` flattens them to `action:resource` strings
   (e.g. `read:wallet`, `create:budget`) and ships the array to the client in the login payload.

The single canonical guard is `src/roles/guards/roles.guard.ts` (the duplicate that used to live at
`src/auth/guards/roles.guard.ts` has been removed). Both `Roles` decorators —
`src/common/decorators/roles.decorator.ts` and `src/roles/decorators/roles.decorator.ts` — are identical
and write the same `'roles'` metadata key, so they are interchangeable.

**Gate new admin endpoints on permissions, not role names.** Use
`@UseGuards(JwtAuthGuard, PermissionsGuard)` + `@RequirePermissions('read:role')`
(`src/auth/guards/permissions.guard.ts`, `src/auth/decorators/permissions.decorator.ts`). It checks the
same `action:resource` strings the frontend gates on, so server and client agree by construction, and it
survives roles being renamed. All listed permissions are required — the server-side mirror of
`<ProtectedRoute allOf={[...]}>`. Beyond these controllers, everything else still stops at "is this
request authenticated", so treat a client-side gate as UX, not security.

⚠️ **Never hardcode `'admin'` in a role check.** In this database the privileged role is literally
**`superadmin`** (one word). A `Role` row named `admin` exists but *no user holds it*, so
`@Roles('admin', 'super_admin')` matches nobody and returns 403 to your actual administrators. Role names
are deployment data; permissions are the stable contract. The role-name path
(`RolesGuard` + `@Roles(...)`, `src/roles/guards/roles.guard.ts`) still exists for `agents.controller.ts`
and accepts either the JWT `role` claim or a `UserRole` row — but prefer `PermissionsGuard` for anything new.

`AgentGuard` (`src/agents/guards/agent.guard.ts`) requires an `AgentProfile` with `status: 'active'`
**and** `kycStatus: 'verified'`, then attaches it as `request.agent`.

## Frontend architecture

```
src/modules/<feature>/
  api/index.ts        # plain async functions calling the shared axios instance
  components/*.tsx
  pages/*.tsx
```

22 modules: `auth`, `dashboard`, `wallet`, `send-money`, `history`, `tontine`,
`tontine-contribution`, `tontine-invitation`, `budget`, `budget-category`, `expense`,
`payment-links`, `agent-dashboard`, `agent-crm`, `crypto-exchange`, `currency-exchange`,
`fee-management`, `user`, `role`, `settings`, `backup`, `public`.

**All HTTP goes through `src/lib/axios.ts`.** That instance:
- reads the access token via a getter injected from `src/redux/store.ts` (`setAccessTokenGetter`),
- on 401 refreshes once, queues concurrent failures in `failedQueue`, replays them,
- dispatches a `window` `"logout"` event when refresh fails.

Never import bare `axios` in feature code. (`redux/slices/authSlice.ts` does, for the bootstrap
refresh call — that is the one legacy exception, not a pattern to copy.)

Redux slices (`src/redux/slices/`): `auth`, `dashboard`, `language`, `theme`, `sidebar`, `loader`,
`toast`, `tableColumnSettings`. Permissions are read via `selectPermissions` (`redux/selectors/`).

Permission gating — reuse this trio, never invent a parallel mechanism:
- routes: `<ProtectedRoute allOf={["read:wallet"]}>` in `src/routes/index.tsx`
- UI fragments: `<Can allOf={[...]} anyOf={[...]}>` in `src/components/custom/Can.tsx`
- nav visibility: `permission: [...]` entries in `src/components/module/admin/layout/SidebarMenu.tsx`

Tables: TanStack React Table behind `src/hooks/useTable.ts` + `src/components/custom/Table.tsx` +
`ColumnVisibilityManager`. Column preferences persist per user via `src/api/table.ts`. Reuse — don't rebuild.

Other conventions: path alias `@/*` → `./src/*` (declared in both `vite.config.ts` and `tsconfig.app.json`);
shadcn/ui in `src/components/ui/` (style `new-york`, base color gray, lucide icons — see `components.json`);
custom shared widgets in `src/components/custom/`; admin chrome in `src/components/module/admin/layout/`.

## Conventions

- **Files/folders**: kebab-case everywhere on the backend (`payment-links/create-payment-link.dto.ts`);
  `PascalCase.tsx` for React components, `camelCase.ts` for hooks/utils/slices.
- **Every request body gets a DTO** with `class-validator` decorators — the global `ValidationPipe`
  whitelists, so undeclared fields are silently dropped.
- **Throw Nest HTTP exceptions** (`NotFoundException`, `BadRequestException`, …). Some older controllers
  `try/catch` and `return { message, error }` instead — that swallows the status code. Don't copy it.
- **List endpoints** return `{ data, meta: { total, page, limit, totalPages } }`. Match that shape;
  `useTable` on the frontend expects `{ data, total }`.
- **UI strings** go through `t('key', 'English fallback')` from `useTranslations()` — see Known issues #5.
- **Ports**: the API honours `PORT` (default 3000). Handy for running a second instance on e.g. `PORT=3100`
  to verify a change without stopping a dev server already on 3000.
- Prefer `@/...` imports over deep relative paths on the frontend.
- **Never commit secret values.** Reference env var *names* only: `DATABASE_URL`, `JWT_ACCESS_SECRET`,
  `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRATION`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
  `MOMO_COLLECTION_API_KEY`, `ORANGE_MONEY_MERCHANT_KEY`, `TRANSFI_PASSWORD`, `SMTP_PASSWORD`,
  `GOOGLE_CLIENT_SECRET`, and on the frontend `VITE_APP_API_URL`, `VITE_STRIPE_PUBLISHABLE_KEY`.
  All `.env*` files are gitignored and hold live keys.

## Domain glossary

- **Tontine** — a rotating savings & credit association (ROSCA). Members contribute each round;
  one member receives the pot per round. Managed by a creator plus `TontineCoAdmin`s; payout order
  is a deliberate business decision, not a queue — confirm the rules before changing them.
- **Agent** — a human cash-in/cash-out point. `AgentProfile`, `AgentCashTransaction`,
  `AgentDaySettlement` (end-of-day reconciliation), and `FloatRequest` (agent asks to top up their float).
  Two distinct authorization models apply in `agents.controller.ts`: an agent's *own* routes
  (`/agents/profile`, `/agents/my-code`, `/agents/dashboard/stats`) use `AgentGuard` — identity, not
  privilege — while admin management (`/agents/all`, approve/suspend/activate/commission) uses
  `PermissionsGuard` with `read:agent-crm` / `update:agent-crm`. `POST /agents/register` is `@Public()`
  because it creates the user account itself. Note the DB carries two naming conventions for agent
  permissions — kebab (`agent-crm`, `agent-dashboard`, what the frontend uses) and snake
  (`agent_profile`, `agent_transactions`); prefer kebab.
- **Payment link** — merchant-shareable Stripe-backed checkout URL. Public, unauthenticated routes:
  `/pay/:linkId`, `/payment-link/success`, `/payment-link/cancel`.
- **KYC / approval** — `User.kycStatus`, `User.approvalStatus`, `User.agentStatus` are free-form strings
  (`pending`, `verified`, `active`, …), not enums. Check exact literals before comparing.
- **Wallet** — `User.walletBalance`, topped up via `wallet-topup`, withdrawn via `wallet-payout`.

## Known issues & do-not-touch

1. **`req.user` shape mismatch (live bug — 6 remaining).** Fixed in `agents.controller.ts` and both
   guards; still present in `auth.controller.ts` (`verify-email`, `confirm-password`, `set-password`),
   `expenses.controller.ts` (×2) and `wallet-topup.controller.ts` (`getMonthlyStats`). Those endpoints
   pass `undefined` as the user id today. Historical detail: the strategy returns `userId`, but call sites read
   `req.user.id` — all of `agents.controller.ts`, three `auth.controller.ts` endpoints
   (`verify-email`, `confirm-password`, `set-password`), `expenses.controller.ts`,
   `wallet-topup.controller.ts` — and `SwaggerPermissionGuard` reads `user.sub || user.id`.
   Those resolve to `undefined`, so e.g. `AgentGuard` queries `agentProfile` with `userId: undefined`.
   Use `req.user.userId` in new code; **flag** existing occurrences rather than silently mass-fixing them.
2. **Swagger is sandbox-only.** It mounts only when `ENABLE_SWAGGER=true` *and* `APP_ENV !== 'production'`
   (`src/swagger/setup-swagger.ts`), and nginx separately 404s `/api-docs*` on `api.kongossapay.com`.
   Schemas come from the `@nestjs/swagger` CLI plugin in `nest-cli.json`, which infers them from
   class-validator DTOs — so a new DTO is documented automatically, but a route taking a raw
   `@Body() body: any` documents as an empty object. See [docs/sandbox-api-access.md](docs/sandbox-api-access.md).
3. **Five modules are declared but never registered in `app.module.ts`**, so their controllers are dead
   code and their routes 404: `AgentsModule`, `AirtelMoneyModule`, `RolePermissionsModule`,
   `TransactionLimitsModule`, `UserRolesModule`. Before debugging "why does this endpoint 404", check
   whether its module is in the imports array. Registering one instantly exposes a new route surface —
   treat it as a deliberate change, not a fix.
4. **The `.gitignore` entries for `src/main.ts`, `nginx.conf`, `docker-compose*.yml` and the Dockerfiles
   are stale and misleading.** Those files were committed before the rules were added, and gitignore does
   not affect already-tracked files — edits to them commit normally. Only genuinely untracked files
   (`.env`, `.env.sandbox`, `*.sql`, `*.bat`) are actually excluded.
5. **i18n is wired but empty.** `useTranslations()` → `languageSlice` → dynamic import of
   `@/lang/<lang>.json`, and `src/lang/` contains **no files**. Every lookup falls through, so the
   second argument is what actually renders. Keep writing `t('key', 'English text')` and always
   supply a real fallback. (`i18next` is installed but unused.)
6. **`.cursor/rules/coding-patten.mdc` is stale and misleading** — it describes a Laravel 12 + Inertia.js
   + MySQL + Sanctum stack from an earlier incarnation of this product. Ignore it entirely.
7. **The root `.gitignore` is a leftover Laravel gitignore** (`vendor`, `bootstrap/ssr`, `.phpunit.cache`).
   Harmless, but it explains the unrelated entries.
8. **TypeScript strictness differs per app.** Backend `tsconfig.json` has `strictNullChecks: false`,
   `noImplicitAny: false`; frontend `tsconfig.app.json` is fully strict with `noUnusedLocals` and
   `noUnusedParameters`. Code that compiles in one will not necessarily compile in the other.
9. **Money types are inconsistent.** `Transaction.amount` / `fee` are Prisma `Decimal(10,2)` while
   `User.walletBalance` is a `Float`. Services convert at the boundary with `Number(...)` or
   `common/utils/decimal.util.ts#toNumber`. Keep conversions explicit; never let a Decimal drift into
   float arithmetic silently.
10. **Debug logging is everywhere** — `MailService`'s constructor logs SMTP config, `ProtectedRoute`
   dumps permissions to the console. Treat it as noise, not instrumentation; don't build on it,
   but don't sweep it out as a side quest either.
11. **Root-level scratch files are not part of the app**: `bfg.jar`, `comparison_prompt.txt`,
    `generate.bat` (a one-off diff-prompt generator pointing at a second developer's checkout),
    `*.sql` backups, `server_files_*.txt`. Leave them alone.

## Working agreements

- Grep for a similar existing feature before introducing any new pattern — this codebase rewards
  copying the sibling module over designing fresh.
- No speculative abstractions or feature flags; build what the current feature needs.
- When a change touches money movement, tontine payout order, or agent settlement, state the
  assumption you are making and confirm it — those are business decisions, not code details.
