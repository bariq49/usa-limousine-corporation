# Operations, Infrastructure & Deployment Runbooks

This guide documents operational procedures, CI/CD automation, server administration, and disaster recovery runbooks for USA Limousine Corporation platform engineers.

---

## 🖥️ Production Infrastructure Topology

| Hostinger VPS Parameter | Production Value                                 |
| :---------------------- | :----------------------------------------------- |
| **Server Hostname**     | `srv2067905.hstgr.cloud`                         |
| **Public IPv4**         | `177.7.55.46`                                    |
| **SSH User**            | `root`                                           |
| **Monorepo Directory**  | `/opt/usa-limousine-corporation`                 |
| **Ingress Proxy**       | Caddy v2 (automated Let's Encrypt TLS)           |
| **Process Manager**     | Docker Compose (`deploy/vps/docker-compose.yml`) |

### Public DNS Mappings (`usalimocorp.com`)

| Host Record | Type |   Target IP   | Purpose                                                    |
| :---------- | :--: | :-----------: | :--------------------------------------------------------- |
| `@`         |  A   | `177.7.55.46` | Apex domain (`https://usalimocorp.com`)                    |
| `www`       |  A   | `177.7.55.46` | Marketing / main portal (`https://www.usalimocorp.com`)    |
| `api`       |  A   | `177.7.55.46` | Core REST API & WebSockets (`https://api.usalimocorp.com`) |
| `admin`     |  A   | `177.7.55.46` | Super Admin Dashboard (`https://admin.usalimocorp.com`)    |
| `customer`  |  A   | `177.7.55.46` | Customer Web Portal (`https://customer.usalimocorp.com`)   |

---

## 🚀 Continuous Integration & Deployment (CI/CD)

The platform utilizes automated GitHub Actions workflows:

### 1. CI Pipeline (`.github/workflows/ci.yml`)

- **Triggers:** Every Pull Request and push to `main`.
- **Validation Stages:**
  1. Monorepo linting (`pnpm lint`) and code formatting check (`pnpm format:check`).
  2. Workspace typechecking (`pnpm typecheck`).
  3. Unit and component tests (`pnpm test` via Vitest).
  4. Backend E2E integration test suite (`pnpm --filter @usa-limousine-corporation/backend test:e2e`).
  5. Cross-browser Playwright smoke tests (`pnpm test:e2e`).
  6. Docker Compose configuration validation.

### 2. CD Deployment Pipeline (`.github/workflows/deploy.yml`)

- **Triggers:** Automated on push to `main` (after CI passes) or manual execution via **Actions ➔ Deploy ➔ Run workflow**.
- **Selective Build Strategy:** To maximize pipeline speed and minimize downtime, only modified components are rebuilt:

| Modified Path                    | Rebuilt Container(s)            |
| :------------------------------- | :------------------------------ |
| `apps/backend/**`                | `backend` (API & BullMQ worker) |
| `apps/admin/**`                  | `admin` dashboard               |
| `apps/customer/**`               | `customer` portal               |
| `packages/ui/**`                 | All frontend dashboards         |
| `deploy/vps/**` or root lockfile | Full stack rebuild              |

- **Health Verification & Auto-Rollback:** Following deployment, `deploy/vps/smoke.sh` performs automated deep health probes. If health checks fail, the previous working container images are restored immediately.

---

## 🛠️ Operational Runbooks

### Runbook 1: Manual Production Deployment via SSH

If GitHub Actions is unavailable, execute a zero-downtime deployment directly on the VPS:

```bash
# 1. Connect to production VPS
ssh root@177.7.55.46

# 2. Navigate to application directory
cd /opt/usa-limousine-corporation

# 3. Pull latest code from main
git pull origin main

# 4. Trigger selective update script
# Rebuild specific services or all services:
DEPLOY_SERVICES="backend admin customer" bash deploy/vps/update.sh

# 5. Verify deployment health
bash deploy/vps/smoke.sh
```

---

### Runbook 2: Database Migration Deployment & Verification

Database schema migrations are managed via Prisma and deployed during container initialization:

```bash
# On the VPS or during local deployment:
cd /opt/usa-limousine-corporation

# Check migration status
pnpm --filter @usa-limousine-corporation/backend db:migrate:status

# Apply pending migrations
NODE_ENV=production pnpm --filter @usa-limousine-corporation/backend db:migrate:deploy
```

> [!CAUTION]
> **Zero Destructive Migrations:** Never execute `prisma migrate reset` in a production environment. All production migrations must be forward-only.

---

### Runbook 3: PostgreSQL Database Backup & Restore

#### Creating a Backup

```bash
# Execute on VPS host
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/usa-limo-postgres"
mkdir -p "$BACKUP_DIR"

docker exec -t usa-limo-postgres pg_dump -U usa_limo -d usa_limousine_corporation -F c -b -v \
  -f "/tmp/backup_${TIMESTAMP}.dump"

docker cp usa-limo-postgres:"/tmp/backup_${TIMESTAMP}.dump" "$BACKUP_DIR/backup_${TIMESTAMP}.dump"
docker exec -t usa-limo-postgres rm "/tmp/backup_${TIMESTAMP}.dump"

echo "Backup completed: $BACKUP_DIR/backup_${TIMESTAMP}.dump"
```

#### Restoring from Backup

```bash
# Stop backend to prevent active database connections
docker compose -f deploy/vps/docker-compose.yml stop backend

# Restore database dump
RESTORE_FILE="/var/backups/usa-limo-postgres/backup_20261018_120000.dump"
docker cp "$RESTORE_FILE" usa-limo-postgres:/tmp/restore.dump

docker exec -t usa-limo-postgres pg_restore -U usa_limo -d usa_limousine_corporation \
  --clean --if-exists --no-owner --no-privileges -v /tmp/restore.dump

# Restart backend service
docker compose -f deploy/vps/docker-compose.yml start backend
```

---

### Runbook 4: Emergency Incident Response & Diagnostics

When receiving alerts regarding service degradation:

#### 1. Inspect Health Probe Status

```bash
curl -s -i https://api.usalimocorp.com/api/v1/health
```

Expected output:

```json
{
  "status": "ok",
  "database": "up",
  "redis": "up",
  "queue": "up",
  "storage": "up",
  "email": "up",
  "websocket": "up"
}
```

#### 2. Inspect Service Logs

```bash
# Tail live logs for the API and worker containers
docker compose -f /opt/usa-limousine-corporation/deploy/vps/docker-compose.yml logs -f --tail=100 backend

# Tail Caddy ingress proxy logs
docker compose -f /opt/usa-limousine-corporation/deploy/vps/docker-compose.yml logs -f --tail=100 caddy
```

#### 3. Inspect Redis Queue Health

```bash
# Query Redis BullMQ queues
docker exec -it usa-limo-redis redis-cli ping
docker exec -it usa-limo-redis redis-cli info memory
```

#### 4. Restarting Services Gracefully

```bash
cd /opt/usa-limousine-corporation/deploy/vps
docker compose restart backend
docker compose restart admin
docker compose restart customer
```

---

### Runbook 5: Caddy Reverse Proxy & TLS Certificate Maintenance

Caddy automatically provisions and renews TLS certificates via Let's Encrypt.

- **Configuration File:** `deploy/vps/Caddyfile`
- **Reloading Config Without Downtime:**
  ```bash
  docker compose -f /opt/usa-limousine-corporation/deploy/vps/docker-compose.yml exec -w /etc/caddy caddy caddy reload
  ```
- **Checking Certificate Status:**
  ```bash
  curl -vI https://www.usalimocorp.com 2>&1 | grep -i "server certificate"
  ```
