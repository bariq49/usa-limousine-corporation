# Backend

NestJS API foundation for the USA Limousine Corporation multi-tenant platform.

## Phase 3 scope

This package includes the production-ready backend shell plus reusable infrastructure:

- Configuration and environment validation
- Global validation, response shaping, and error handling
- Security middleware (Helmet, CORS, compression, cookies, trust proxy)
- API prefix, URI versioning, Swagger, and health check
- PostgreSQL via Prisma (migrations, singleton client, health probe)
- Redis (singleton client)
- BullMQ queues (`BullMqQueue` + `BaseQueueService`; `QUEUE_MODE` for api/worker split)
- Email engine (provider-swappable; Nodemailer default)
- Storage facade (provider-swappable; Cloudinary default)
- WebSocket foundation (Socket.IO; no business events)

Business modules and authentication are intentionally deferred.

## Scripts

```bash
# from repository root
pnpm --filter @usa-limousine-corporation/backend dev
pnpm --filter @usa-limousine-corporation/backend dev:worker
pnpm --filter @usa-limousine-corporation/backend build
pnpm --filter @usa-limousine-corporation/backend start:worker
pnpm --filter @usa-limousine-corporation/backend typecheck
pnpm --filter @usa-limousine-corporation/backend lint
pnpm --filter @usa-limousine-corporation/backend test
pnpm --filter @usa-limousine-corporation/backend test:e2e

# database
pnpm --filter @usa-limousine-corporation/backend db:generate
pnpm --filter @usa-limousine-corporation/backend db:migrate
pnpm --filter @usa-limousine-corporation/backend db:migrate:deploy
pnpm --filter @usa-limousine-corporation/backend db:migrate:deploy:test
pnpm --filter @usa-limousine-corporation/backend db:migrate:reset
pnpm --filter @usa-limousine-corporation/backend db:seed
pnpm --filter @usa-limousine-corporation/backend db:studio
```

## Environment

Create `.env` (or `.env.development` / `.env.test` / `.env.production`).

Load order:

`.env.<NODE_ENV>.local` → `.env.<NODE_ENV>` → `.env`

Host environment variables always override file values.

### Required

| Variable                        | Purpose                                                                                                     |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `NODE_ENV`                      | `development` \| `test` \| `production`                                                                     |
| `PORT`                          | HTTP listen port                                                                                            |
| `CORS_ORIGIN`                   | Allowed frontend origin(s); comma-separated in production                                                   |
| `TRUST_PROXY`                   | `1` when behind nginx / Caddy / load balancer                                                               |
| `DATABASE_URL`                  | PostgreSQL connection string (URL-encode special chars)                                                     |
| `REDIS_URL`                     | Redis connection URL (required for queues, Socket.IO adapter, WS limits)                                    |
| `REDIS_KEY_PREFIX`              | Optional shared-Redis prefix (e.g. `usa_limo` → `usa_limo:` keys, `usa_limo:bull` queues)                   |
| `QUEUE_MODE`                    | Optional `all` (local default) \| `api` (production API) \| `worker` (production worker) — see Queues below |
| `QUEUE_BOARD_ENABLED`           | Optional `true` to mount Bull Board UI on the API process                                                   |
| `QUEUE_BOARD_USERNAME`          | Required when Bull Board is enabled                                                                         |
| `QUEUE_BOARD_PASSWORD`          | Required when Bull Board is enabled (never log)                                                             |
| `QUEUE_BOARD_PATH`              | Optional Bull Board path (default `/admin/queues`)                                                          |
| `REDIS_SENTINELS`               | Optional `host:port,host:port` Sentinel nodes                                                               |
| `REDIS_SENTINEL_NAME`           | Required when using sentinels (e.g. `mymaster`)                                                             |
| `REDIS_TLS_REJECT_UNAUTHORIZED` | Optional TLS verify flag for `rediss://` (default true)                                                     |
| `WS_CORS_ORIGIN`                | WebSocket CORS origins (comma-separated)                                                                    |
| `WS_PORT`                       | Optional documented port (shares HTTP `PORT`)                                                               |
| `CLOUDINARY_CLOUD_NAME`         | Cloudinary cloud name (required)                                                                            |
| `CLOUDINARY_API_KEY`            | Cloudinary API key (required)                                                                               |
| `CLOUDINARY_API_SECRET`         | Cloudinary API secret (required)                                                                            |
| `EMAIL_HOST`                    | SMTP host (required for verification-based login)                                                           |
| `EMAIL_PORT`                    | SMTP port                                                                                                   |
| `EMAIL_USER`                    | SMTP username                                                                                               |
| `EMAIL_PASS`                    | SMTP password                                                                                               |
| `EMAIL_SECURE`                  | `true` for TLS                                                                                              |
| `EMAIL_FROM`                    | Default From address                                                                                        |

### Optional infrastructure

Unset optional services report `not_configured` in health and do not block startup.

| Variable                       | Purpose                                                     |
| ------------------------------ | ----------------------------------------------------------- |
| `DEFAULT_ADMIN_EMAIL`          | Admin inbox for new driver application emails               |
| `STRIPE_SECRET_KEY_TEST`       | Stripe test secret (`sk_test_…`; optional outside prod)     |
| `STRIPE_WEBHOOK_SECRET_TEST`   | Stripe test webhook signing secret                          |
| `STRIPE_SECRET_KEY_LIVE`       | Stripe live secret (`sk_live_…`; needed for LIVE mode)      |
| `STRIPE_WEBHOOK_SECRET_LIVE`   | Stripe live webhook signing secret                          |
| `STRIPE_API_VERSION`           | Optional Stripe API version                                 |
| `STRIPE_TIMEOUT_MS`            | Optional Stripe request timeout                             |
| `STRIPE_MAX_NETWORK_RETRIES`   | Optional Stripe network retries                             |
| `PAYMENT_CHECKOUT_SUCCESS_URL` | Default Stripe Checkout success URL                         |
| `PAYMENT_CHECKOUT_CANCEL_URL`  | Default Stripe Checkout cancel URL                          |
| `DRIVER_APP_URL`               | Driver app base URL (subscription success/cancel redirects) |
| `FIREBASE_PROJECT_ID`          | Firebase project id (FCM push; optional until configured)   |
| `FIREBASE_CLIENT_EMAIL`        | Firebase service account email                              |
| `FIREBASE_PRIVATE_KEY`         | Firebase service account private key (`\n` escaped OK)      |
| `TWILIO_ACCOUNT_SID`           | Twilio account SID (SMS; optional until configured)         |
| `TWILIO_AUTH_TOKEN`            | Twilio auth token                                           |
| `TWILIO_SENDER_ID`             | SMS sender name, max 11 characters (e.g. `USALimoCorp`)     |
| `AGORA_APP_ID`                 | Agora App ID (trip audio RTC tokens; optional until set)    |
| `AGORA_APP_CERTIFICATE`        | Agora App Certificate                                       |
| `AGORA_TOKEN_TTL_SECONDS`      | Agora token TTL (default `3600`)                            |

Local Stripe webhook (dev):

```bash
stripe listen --forward-to http://localhost:3000/api/v1/payments/webhooks/stripe
```

Webhook endpoint path: `http://localhost:3000/api/v1/payments/webhooks/stripe`

## Infrastructure

Business modules must consume facades only:

- `EmailService` → `NodemailerEmailProvider` (Nodemailer today; SES/SendGrid later)
- `StorageService` → `STORAGE_PROVIDER` (Cloudinary today; S3/ImageKit later; required)
- `StripeService` → Stripe SDK client + webhook verification (optional)
- `FirebaseService` → Firebase Admin / FCM push (optional)
- `TwilioService` → Twilio SMS client (optional)
- `RedisService` — shared Redis client (required)
- `BullMqQueue` / `BaseQueueService` — shared BullMQ lifecycle for domain `*QueueService` (requires Redis)
- Health uses `probeBullMqHealth` (no dedicated infrastructure ping queue)
- `WebsocketService` — connection/room/broadcast helpers (no business events; required)
- `PrismaService` — database (frozen)

Provider replacement requires zero business-layer changes.

## Queues

Local default: `QUEUE_MODE=all` (HTTP API and BullMQ workers in one process).

**Production:** run separate processes — do **not** run both API and worker with `QUEUE_MODE=all`:

| Process | `QUEUE_MODE` | Command                                                              |
| ------- | ------------ | -------------------------------------------------------------------- |
| API     | `api`        | `pnpm --filter @usa-limousine-corporation/backend start:prod`        |
| Worker  | `worker`     | `pnpm --filter @usa-limousine-corporation/backend start:prod:worker` |

Using `QUEUE_MODE=all` on multiple processes duplicates workers and is intended for local development only.

Worker boots `WorkerModule` (queues + domain deps only — no Socket.IO gateway / HTTP controllers).

Shared job defaults live in `DEFAULT_JOB_OPTIONS`. Metrics: `GET /api/v1/health/queues`. Optional Bull Board: `QUEUE_BOARD_ENABLED=true` with `QUEUE_BOARD_USERNAME` / `QUEUE_BOARD_PASSWORD`.

## Notification delivery

When a notification is created for a driver:

1. One **database** notification row is written (authoritative inbox).
2. A **WebSocket** event is emitted to the driver’s authorized room(s).
3. If push is enabled and the driver has an FCM token + push settings, an **FCM** push is also enqueued.

Online drivers may therefore receive both a live WebSocket event and an FCM push for the same domain notification. That is the current product behavior; there is no “FCM only when offline” gate. Both channels represent the same notification — they do not create duplicate inbox rows.

## Health

`GET /api/v1/health` reports:

```json
{
  "status": "ok",
  "database": "up",
  "redis": "up",
  "queue": "up",
  "storage": "up",
  "email": "up",
  "websocket": "up",
  "stripe": "not_configured",
  "firebase": "not_configured",
  "twilio": "not_configured"
}
```

- `503` only when `database` is `down`
- Redis, queue, storage, email, and websocket are required; when down they mark overall `status` as `degraded`
- Stripe, Firebase, and Twilio are optional; `not_configured` does not degrade overall status

Swagger (non-production): `/api/docs`

How to get Twilio / Firebase / Stripe / Cloudinary / email keys: [`docs/guide.md`](./docs/guide.md).

Authentication contract (access JWT, refresh cookie, CSRF, `/auth/me`): `docs/authentication.md`.

## Database setup (local)

```bash
createdb usa_limousine_corporation
createdb usa_limousine_corporation_test
pnpm --filter @usa-limousine-corporation/backend db:migrate:deploy
pnpm --filter @usa-limousine-corporation/backend db:migrate:deploy:test
```

## E2E tests

E2E uses real PostgreSQL via `.env.test`. Redis (`REDIS_URL`) and WebSocket (`WS_CORS_ORIGIN`) are required.

```bash
pnpm --filter @usa-limousine-corporation/backend test:e2e
```

## Production VPS deployment

```bash
pnpm --filter @usa-limousine-corporation/backend build
NODE_ENV=production pnpm --filter @usa-limousine-corporation/backend db:migrate:deploy
# API (enqueue only): QUEUE_MODE=api
pnpm --filter @usa-limousine-corporation/backend start:prod
# Worker (consumers): QUEUE_MODE=worker
pnpm --filter @usa-limousine-corporation/backend start:prod:worker
```

`start:prod` / `start:prod:worker` set `NODE_ENV=production` (loads `.env.production`, disables Swagger on the API).

### Migration rollback

Prisma does not auto-generate down migrations. Restore a backup or create a forward reverse migration. Never edit applied migration files in production.
