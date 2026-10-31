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

| Variable                            | Purpose                                                  |
| ----------------------------------- | -------------------------------------------------------- |
| `DEFAULT_ADMIN_EMAIL`               | Admin inbox for new and paid booking emails              |
| `SQUARE_ACCESS_TOKEN_TEST`          | Square sandbox access token                              |
| `SQUARE_LOCATION_ID_TEST`           | Square sandbox location id                               |
| `SQUARE_WEBHOOK_SIGNATURE_KEY_TEST` | Signature key of the sandbox webhook subscription        |
| `SQUARE_ACCESS_TOKEN_LIVE`          | Square production access token                           |
| `SQUARE_LOCATION_ID_LIVE`           | Square production location id                            |
| `SQUARE_WEBHOOK_SIGNATURE_KEY_LIVE` | Signature key of the production webhook subscription     |
| `SQUARE_WEBHOOK_URL`                | Public webhook URL exactly as entered in Square          |
| `WEBSITE_URL`                       | Public website; Square redirects and email images use it |
| `GOOGLE_REVIEW_URL`                 | Google review link in the ride completed email           |
| `FIREBASE_PROJECT_ID`               | Firebase project id (optional; health status only)       |
| `FIREBASE_CLIENT_EMAIL`             | Firebase service account email                           |
| `FIREBASE_PRIVATE_KEY`              | Firebase service account private key (`\n` escaped OK)   |
| `TWILIO_ACCOUNT_SID`                | Twilio account SID (SMS; optional until configured)      |
| `TWILIO_AUTH_TOKEN`                 | Twilio auth token                                        |
| `TWILIO_SENDER_ID`                  | SMS sender name, max 11 characters (e.g. `USALimoCorp`)  |

See [Payments (Square)](#payments-square) for running Square locally.

## Payments (Square)

Riders pay as guests on a Square-hosted checkout page. The website calls
`POST /public/bookings/checkout`, which saves the booking as `PENDING` (priced on the server) and
returns a Square payment link. When Square reports the payment, the API records a `Payment`
(`PAID`, with a `TID-` transaction id, card brand and last 4) and confirms the booking, then emails
the rider and `DEFAULT_ADMIN_EMAIL` and texts the rider.

- Square's `payment.created` / `payment.updated` webhooks hit `POST /payments/square/webhook`.
- Square sends the rider back to `/book-ride/payment-success`; that page also asks Square directly,
  so it does not wait for the webhook.
- Square links never expire, so every 5 minutes the API checks unpaid checkouts older than
  30 minutes: paid ones are recorded, the rest are cancelled and their link deleted.

The **Live Payment Mode** switch in admin **Platform settings** picks the keys: off uses the
`_TEST` (sandbox) keys, on uses the `_LIVE` (production) keys.

### Run it locally

1. In the [Square Developer Console](https://developer.squareup.com/apps), open your app and
   switch to **Sandbox**. Copy the **Sandbox access token** and, under **Locations**, the sandbox
   location id into `apps/backend/.env`:

   ```env
   SQUARE_ACCESS_TOKEN_TEST=EAAA...
   SQUARE_LOCATION_ID_TEST=L...
   WEBSITE_URL=http://localhost:3003
   ```

2. Square must reach your machine for webhooks. Start a tunnel to the API, for example
   `ngrok http 3000`, and note the `https://…` URL.
3. In the console go to **Webhooks → Subscriptions → Add subscription** (Sandbox):
   - URL: `https://<tunnel>/api/v1/payments/square/webhook`
   - Events: `payment.created`, `payment.updated`

   Copy its **Signature key** and set both values in `.env`, then restart the backend:

   ```env
   SQUARE_WEBHOOK_URL=https://<tunnel>/api/v1/payments/square/webhook
   SQUARE_WEBHOOK_SIGNATURE_KEY_TEST=...
   ```

   `SQUARE_WEBHOOK_URL` must match the subscription URL exactly, or signatures will not verify.
   Without a tunnel, payments are still confirmed when the rider lands on the success page.

4. Start the apps (`pnpm dev` from the repository root) and make sure **Live Payment Mode** is off.
5. Book a ride on the website and pay with a
   [sandbox test card](https://developer.squareup.com/docs/devtools/sandbox/payments):
   `4111 1111 1111 1111`, any future expiry, CVV `111`, any ZIP.

You should land on the payment success page with the booking confirmed, and the emails and SMS go
out. Going back from the Square page opens `/book-ride/payment-cancel`, where the rider can resume
payment or edit the booking.

### Production

1. In the console switch to **Production**, copy the production access token and location id into
   `apps/backend/.env.production` as `SQUARE_ACCESS_TOKEN_LIVE` and `SQUARE_LOCATION_ID_LIVE`.
2. Add a production webhook subscription for `https://<api-domain>/api/v1/payments/square/webhook`
   with `payment.created` and `payment.updated`, and set `SQUARE_WEBHOOK_URL` and
   `SQUARE_WEBHOOK_SIGNATURE_KEY_LIVE`.
3. Copy the env file to the server with `deploy/vps/push-env.sh`, deploy, then turn on **Live
   Payment Mode**.

While the active mode is not fully configured, checkout answers "Online payment is not available
right now".

## Infrastructure

Business modules must consume facades only:

- `EmailService` → `NodemailerEmailProvider` (Nodemailer today; SES/SendGrid later)
- `StorageService` → `STORAGE_PROVIDER` (Cloudinary today; S3/ImageKit later; required)
- `SquareService` → Square payment links, order lookup + webhook verification (optional)
- `FirebaseService` → Firebase Admin configuration and health (optional)
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

Notification delivery:

1. One **database** notification row is written (authoritative inbox).
2. A **WebSocket** event is emitted to the recipient’s authorized room(s) when the server or Redis is ready.
3. Only successfully dispatched events are marked delivered. Unavailable or failed dispatches use bounded exponential backoff and an expiring database lease to prevent concurrent workers from sending the same row.

After eight failed attempts, a notification moves to the dead-letter queue. Super admins can inspect `GET /api/v1/notifications/delivery-status` and page through `GET /api/v1/notifications/dead-letters?limit=50&cursor=...`, then retry one with `POST /api/v1/notifications/:id/retry`.

The database inbox remains authoritative; `deliveredAt` records successful realtime dispatch, not acknowledgement by a connected client. A crash after transport dispatch but before the database update can cause a duplicate event, so delivery is at-least-once and clients should deduplicate by notification ID.

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
  "firebase": "not_configured",
  "twilio": "not_configured"
}
```

- `503` only when `database` is `down`
- Redis, queue, storage, email, and websocket are required; when down they mark overall `status` as `degraded`
- Firebase and Twilio are optional; `not_configured` does not degrade overall status

Swagger (non-production): `/api/docs`

How to get Twilio / Firebase / Square / Cloudinary / email keys: [`docs/guide.md`](./docs/guide.md).

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
