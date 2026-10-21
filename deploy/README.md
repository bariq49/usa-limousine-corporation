# Deploy USA Limousine Corporation (Hostinger VPS)

Stack on one VPS with Docker Compose: **Postgres, Redis, Nest API, Admin, Customer, Caddy (HTTPS)**.

| Hostinger | Value |
| --- | --- |
| Hostname | `srv2067905.hstgr.cloud` |
| Public IP | `177.7.55.46` |
| SSH | `ssh root@177.7.55.46` |
| Install dir | `/opt/usa-limousine-corporation` |
| DB backups | `/opt/usa-limousine-corporation-backups` (last 10 kept) |

| Live URL | Service |
| --- | --- |
| `https://api.usalimocorp.com/api/v1` | REST API (WebSocket on `https://api.usalimocorp.com`) |
| `https://admin.usalimocorp.com` | Admin dashboard |
| `https://login.usalimocorp.com`, `https://www.usalimocorp.com`, `https://usalimocorp.com` | Customer dashboard |

## How a deploy works

A push to `main` runs **Actions → Deploy** (`.github/workflows/deploy.yml`):

1. Detects what changed and runs CI for just that part.
2. Rsyncs the repo to `/opt/usa-limousine-corporation` (never overwrites `.env*` files on the VPS).
3. Runs `deploy/vps/update.sh` on the VPS:
   - **backs up Postgres** before any backend deploy (`pg_dump`, gzip);
   - rebuilds only the changed services; the backend applies Prisma migrations on start;
   - waits for health checks and **rolls back** the rebuilt images if they fail;
   - runs smoke checks.

| Change under | Rebuilds |
| --- | --- |
| `apps/backend/**` | `backend` |
| `apps/admin/**` / `apps/customer/**` | that dashboard |
| `packages/ui/**` | both dashboards |
| lockfile, root tooling, `deploy/vps/**`, the workflow | everything |

Manual run: **Actions → Deploy → Run workflow** and pick `auto`, `all`, `backend`, `dashboards`, `admin` or `customer`.

---

## First-time setup

### 1. DNS (Hostinger → Domains → `usalimocorp.com` → DNS)

| Type | Name | Points to | TTL |
| --- | --- | --- | --- |
| A | `api` | `177.7.55.46` | 300 |
| A | `admin` | `177.7.55.46` | 300 |
| A | `login` | `177.7.55.46` | 300 |
| A | `@` | `177.7.55.46` | 300 |
| A | `www` | `177.7.55.46` | 300 |

Caddy requests HTTPS certificates automatically once these resolve.

### 2. SSH key for GitHub Actions

Create a dedicated key pair (no passphrase) on your laptop — never commit it:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/usa-limo-github-deploy -N "" -C "github-actions-usa-limousine-corporation"
```

Install the **public** key on the VPS (asks for the root password once — Hostinger panel → **Reset password** if you don't have it):

```bash
ssh-copy-id -i ~/.ssh/usa-limo-github-deploy.pub root@177.7.55.46
ssh -i ~/.ssh/usa-limo-github-deploy root@177.7.55.46 'echo key works'
```

### 3. Prepare the VPS (once)

Installs Docker, rsync and a firewall (SSH, 80, 443):

```bash
ssh -i ~/.ssh/usa-limo-github-deploy root@177.7.55.46 \
  'mkdir -p /opt/usa-limousine-corporation/deploy/vps'
scp -i ~/.ssh/usa-limo-github-deploy deploy/vps/bootstrap.sh \
  root@177.7.55.46:/opt/usa-limousine-corporation/deploy/vps/
ssh -i ~/.ssh/usa-limo-github-deploy root@177.7.55.46 \
  'bash /opt/usa-limousine-corporation/deploy/vps/bootstrap.sh'
```

### 4. Production env files

They live only on the VPS (gitignored; deploys never overwrite them). From your laptop, with the
three `.env.production` files filled in:

```bash
VPS_HOST=177.7.55.46 SSH_KEY=~/.ssh/usa-limo-github-deploy bash deploy/vps/push-env.sh
```

| File | Must contain |
| --- | --- |
| `apps/backend/.env.production` | `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN`, `WS_CORS_ORIGIN`, `EMAIL_*`, `CLOUDINARY_*`, `DEFAULT_ADMIN_EMAIL` (optional: `FIREBASE_*`, `TWILIO_*`) |
| `apps/admin/.env.production` | `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_ENV`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` |
| `apps/customer/.env.production` | `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_ENV` |

`DATABASE_URL` and `REDIS_URL` are set by `docker-compose.yml`; you don't need them in the file.
Generate secrets with `openssl rand -base64 48`.

### 5. GitHub secrets

GitHub → **bariq49/usa-limousine-corporation → Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Value |
| --- | --- |
| `VPS_HOST` | `177.7.55.46` |
| `VPS_USER` | `root` |
| `VPS_SSH_KEY` | the whole **private** key: `cat ~/.ssh/usa-limo-github-deploy` (from `-----BEGIN OPENSSH PRIVATE KEY-----` to `-----END OPENSSH PRIVATE KEY-----`) |

### 6. Deploy

Push to `main`, or **Actions → Deploy → Run workflow** with scope `all` for the first deploy.

### 7. First admin login

On the very first deploy the database is empty. Seed it once (creates the super admin, luggage types,
a vehicle category and extra services):

```bash
ssh root@177.7.55.46
cd /opt/usa-limousine-corporation/deploy/vps
docker compose --env-file ../../apps/backend/.env.production --env-file ../../apps/admin/.env.production \
  --env-file ../../apps/customer/.env.production exec backend sh -c 'cd /app/apps/backend && pnpm exec prisma db seed'
```

The seed logs in as `info@thedevsquare.com` with the password written in `apps/backend/prisma/seed.ts`
(committed to git). **Change it right away** in the admin dashboard → Profile Settings → Password.
Don't re-run the seed on production afterwards: it resets that account's password to the seed value.

---

## Operations

**Change env values on the VPS**, then redeploy that service:

```bash
cd /opt/usa-limousine-corporation
DEPLOY_SERVICES=backend bash deploy/vps/update.sh   # backend env (Firebase, Twilio, ...)
DEPLOY_SERVICES=admin bash deploy/vps/update.sh     # NEXT_PUBLIC_* is baked in at build time
```

**Logs:** `docker logs -f usa-limousine-corporation-backend-1` (also `-admin-1`, `-customer-1`, `-caddy-1`).

**Health:** `curl -s http://127.0.0.1:3000/api/v1/health` on the VPS, or `https://api.usalimocorp.com/api/v1/health`.

**Database backups** run automatically before every backend deploy. Manual backup / restore:

```bash
# backup now
BACKUP_KEEP=10 bash -c 'docker exec usa-limousine-corporation-postgres-1 sh -c "pg_dump -U \$POSTGRES_USER -d \$POSTGRES_DB --no-owner --no-privileges" | gzip > /opt/usa-limousine-corporation-backups/db-manual-$(date -u +%Y%m%dT%H%M%SZ).sql.gz'

# restore (stops the API while restoring)
cd /opt/usa-limousine-corporation/deploy/vps
docker stop usa-limousine-corporation-backend-1
gunzip -c /opt/usa-limousine-corporation-backups/<file>.sql.gz | \
  docker exec -i usa-limousine-corporation-postgres-1 sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
docker start usa-limousine-corporation-backend-1
```

Skip the automatic backup for one run with `BACKUP_BEFORE_DEPLOY=0`.

**Database migrations** apply automatically when the backend container starts
(`deploy/vps/entrypoint.sh`). Migrations that drop data (for example `20261022120000_remove_driver_domain`)
are covered by the pre-deploy backup above.
