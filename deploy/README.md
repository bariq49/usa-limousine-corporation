# Deploy USA Limousine Corporation (VPS)

Stack: Postgres, Redis, Nest API, Admin, Customer, Caddy.

Pushes to GitHub **do deploy**: a push to `main` runs **Deploy** (selective CI, then VPS).
You can still run **Actions → Deploy → Run workflow** by hand and pick a scope.

**Selective deploys:** only changed apps are rebuilt on the VPS.

| Change under | Rebuilds |
| --- | --- |
| `apps/backend/**` | `backend` |
| `apps/admin/**` (etc.) | that dashboard only |
| `packages/ui/**` | all dashboards |
| lockfile / root tooling / `deploy/vps` infra | everything |

Manual run: choose `auto` (path detect), `all`, `backend`, `dashboards`, or a single app.

Health + rollback apply only to rebuilt services; smokes cover API + rebuilt dashboards.
Stripe keys in production env are **dummy** until live keys are added.

| Hostinger | Value |
| --- | --- |
| Hostname | `srv2067905.hstgr.cloud` |
| Public IP | `177.7.55.46` |

## DNS (Hostinger → `usalimocorp.com`)

| Type | Name | Points to | TTL |
| --- | --- | --- | --- |
| A | `api` | `177.7.55.46` | 300 |
| A | `admin` | `177.7.55.46` | 300 |
| A | `customer` | `177.7.55.46` | 300 |
| A | `@` | `177.7.55.46` | 300 |
| A | `www` | `177.7.55.46` | 300 |

## GitHub Deploy

The workflow is `.github/workflows/deploy.yml`. It runs on push to `main` and via **Run workflow**.

### 1. Push this repo (including workflows) to `main`

GitHub can only run the workflow that exists on GitHub.

### 2. SSH key GitHub Actions will use

On your laptop (or the VPS):

```bash
ssh-keygen -t ed25519 -f ./usa-limo-github-deploy -N "" -C "github-actions-usa-limousine-corporation"
```

Put the **public** key on the VPS:

```bash
ssh-copy-id -i ./usa-limo-github-deploy.pub root@177.7.55.46
```

Keep `usa-limo-github-deploy` (private) only for GitHub. Do not commit it.

### 3. GitHub secrets

Repo **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Value |
| --- | --- |
| `VPS_HOST` | `177.7.55.46` |
| `VPS_USER` | `root` |
| `VPS_SSH_KEY` | full private key (`-----BEGIN OPENSSH PRIVATE KEY-----` …) |

Production `.env` files stay on the VPS. The workflow rsyncs code and **does not** overwrite existing `.env*`.

**Firebase (FCM) on live:** `/health` shows `firebase: not_configured` until these exist in **`/opt/usa-limousine-corporation/apps/backend/.env.production` on the VPS** (not your laptop copy):

```env
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Twilio (SMS) on live:** `/health` shows `twilio: not_configured` until these exist in the same VPS `.env.production`:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=+15551234567
```

**Agora (trip audio calls) on live:** add to the same VPS backend `.env.production`:

```env
AGORA_APP_ID=...
AGORA_APP_CERTIFICATE=...
AGORA_TOKEN_TTL_SECONDS=3600
```

**Admin Google Maps on live:** `NEXT_PUBLIC_*` is baked in at **image build** time. Add to **`/opt/usa-limousine-corporation/apps/admin/.env.production` on the VPS**:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
```

After editing on the VPS:

```bash
cd /opt/usa-limousine-corporation
DEPLOY_SERVICES=backend bash deploy/vps/update.sh   # Firebase / Twilio / Agora
DEPLOY_SERVICES=admin bash deploy/vps/update.sh     # Google Maps (rebuild required)
```

### Database migrations

Backend container startup always runs `prisma migrate deploy` (`deploy/vps/entrypoint.sh`).
Pushing migration files under `apps/backend/prisma/migrations/**` rebuilds `backend` on deploy,
so pending migrations apply automatically before the API starts.

CI also applies migrations on the test DB and fails if the Prisma schema drifts from migration history.

Live URLs: REST `https://api.usalimocorp.com/api/v1` · WebSocket `https://api.usalimocorp.com` (no `/api/v1`)

### 4. Run it

**Actions → Deploy → Run workflow** (branch `main`).

It runs full CI first, then rsyncs to `/opt/usa-limousine-corporation`, Compose up, health/rollback, then `smoke.sh`.
