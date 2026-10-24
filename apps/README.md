# Applications (`apps/`)

Deployable applications and service daemons powering the USA Limousine Corporation platform.

## Workspace Inventory

| Application              | Package                               | Dev Port | Runtime / Framework                  | Primary Purpose                                                      |
| :----------------------- | :------------------------------------ | :------: | :----------------------------------- | :------------------------------------------------------------------- |
| [`backend`](./backend)   | `@usa-limousine-corporation/backend`  |  `3000`  | Node.js 22 + NestJS 11               | Core REST API, WebSocket gateway, BullMQ queues, Prisma ORM          |
| [`admin`](./admin)       | `@usa-limousine-corporation/admin`    |  `3001`  | Node.js 22 + Next.js 15 (App Router) | Platform Super Admin control center (fleet, pricing, payouts, audit) |
| [`customer`](./customer) | `@usa-limousine-corporation/customer` |  `3002`  | Node.js 22 + Next.js 15 (App Router) | Customer web portal (ride booking, live tracking, billing, profile)  |
| [`website`](./website)   | `@usa-limousine-corporation/website`  |  `3003`  | Node.js 22 + Next.js 15 (App Router) | Public marketing website & online booking portal                     |

---

## Architectural Rules

1. **No Inter-App Imports:** Applications are completely isolated from each other at compile and runtime. They never import code or types directly from sibling apps.
2. **Shared UI via `@usa-limousine-corporation/ui`:** Presentation primitives, design tokens, and shells are consumed from `packages/ui`.
3. **Internal HTTP Facades:** Each frontend app encapsulates its own typed HTTP transport facade (e.g. `lib/http/client.ts`), ensuring no leaked transport abstractions.
4. **Environment Isolation:** Every application maintains its own local `.env` (derived from `.env.example`). Secrets are strictly runtime-injected and never committed to version control.

---

## Development Commands

Run applications individually using pnpm workspace filters from the monorepo root:

```bash
# Start backend API (with BullMQ workers in monolithic dev mode)
pnpm --filter @usa-limousine-corporation/backend dev

# Start Super Admin dashboard
pnpm --filter @usa-limousine-corporation/admin dev

# Start Customer portal
pnpm --filter @usa-limousine-corporation/customer dev

# Start Website portal
pnpm --filter @usa-limousine-corporation/website dev

# Start all applications concurrently
pnpm dev
```

---

## Environment Variables Reference

Each application expects its own `.env` configuration file:

- **Backend:** `apps/backend/.env` (see [`apps/backend/README.md`](./backend/README.md))
- **Admin:** `apps/admin/.env` (`NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_ENV`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`)
- **Customer:** `apps/customer/.env` (`NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_ENV`)
- **Website:** `apps/website/.env` (`NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_ENV`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`)

Refer to [`docs/frontend-architecture.md`](../docs/frontend-architecture.md) for detailed frontend architectural guidelines.
