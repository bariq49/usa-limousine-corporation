<div align="center">

# 🚖 USA Limousine Corporation

**Enterprise Multi-Tenant SaaS Platform Monorepo**

[![Node.js](https://img.shields.io/badge/node-22.x-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9.x-F69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Turborepo](https://img.shields.io/badge/turborepo-v2-EF4444?style=flat-square&logo=turborepo&logoColor=white)](https://turbo.build/repo)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/next.js-15-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/nestjs-11-E0234E?style=flat-square&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/redis-7-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

<p align="center">
  A high-performance, production-grade SaaS monorepo powering on-demand and pre-scheduled limousine bookings, real-time driver dispatch, GPS fleet tracking, automated payment outbox, and administrative management.
</p>

[Platform Overview](#-platform-overview) •
[Architecture](#-system-architecture) •
[Repository Layout](#-repository-layout) •
[Technology Stack](#-technology-stack) •
[Getting Started](#-getting-started) •
[Scripts & Tooling](#-monorepo-scripts) •
[Documentation](#-documentation-index) •
[Deployment](#-production-deployment)

</div>

---

## 🎯 Platform Overview

USA Limousine Corporation is an enterprise transportation SaaS platform connecting riders, luxury vehicle operators, and dispatchers. Built with a modular monorepo architecture, the platform guarantees sub-millisecond data caching, strict tenant security boundaries, and high-throughput real-time event streaming.

### Core Ecosystem Roles

| Role                     | Domain Scope     | Primary Responsibility                                                                                               |
| :----------------------- | :--------------- | :------------------------------------------------------------------------------------------------------------------- |
| 👑 **Super Admin**       | Platform-wide    | Manages global fleet posture, driver KYC verification, vehicle categories, financial payouts, and compliance audits. |
| 👥 **Operations Staff**  | Fleet & Dispatch | Monitors live map geospatial tracking (`ops:fleet`), coordinates active rides, and handles customer support tickets. |
| 🚖 **Limousine Drivers** | Mobile & Shift   | Toggles shift availability, streams real-time GPS coordinates, submits ride quotes, and requests wallet payouts.     |
| 👤 **End Customers**     | Web & Mobile     | Books rides, tracks driver arrival in real time, completes secure Stripe payments, and rates trip experiences.       |

---

## 🏛️ System Architecture

```mermaid
graph TD
    subgraph Clients["Client Layer"]
        AdminWeb["Admin Dashboard (Next.js 15)<br/>admin.usalimocorp.com (:3001)"]
        CustomerWeb["Customer Portal (Next.js 15)<br/>login.usalimocorp.com (:3002)"]
        MobileDriver["Driver Mobile App<br/>(React Native / Flutter)"]
    end

    subgraph Ingress["Ingress & Edge Proxy"]
        Caddy["Caddy Reverse Proxy<br/>Automated Let's Encrypt TLS<br/>Port 80/443 (177.7.55.46)"]
    end

    subgraph CoreBackend["Application Services"]
        NestAPI["NestJS API Gateway<br/>Port 3000 (QUEUE_MODE=api)<br/>api.usalimocorp.com"]
        NestWorker["NestJS BullMQ Worker<br/>(QUEUE_MODE=worker)"]
    end

    subgraph DataStore["Persistence & Messaging"]
        Postgres[("PostgreSQL 16<br/>Database: usa_limousine_corporation<br/>Prisma Multi-Schema ORM")]
        Redis[("Redis 7<br/>Distributed Cache, GEO Index,<br/>Socket.IO Adapter & BullMQ")]
    end

    subgraph Gateways["Third-Party Cloud Gateways"]
        Stripe["Stripe Payments (Outbox)"]
        Twilio["Twilio SMS (OTP)"]
        Firebase["Firebase Admin (FCM)"]
        Agora["Agora RTC (In-Trip Audio)"]
        Cloudinary["Cloudinary (Assets & KYC)"]
    end

    AdminWeb -->|HTTPS / WSS| Caddy
    CustomerWeb -->|HTTPS / WSS| Caddy
    MobileDriver -->|HTTPS / WSS| Caddy

    Caddy -->|Reverse Proxy /api/v1| NestAPI
    Caddy -->|Reverse Proxy /socket.io| NestAPI
    Caddy -->|Reverse Proxy :3001| AdminWeb
    Caddy -->|Reverse Proxy :3002| CustomerWeb

    NestAPI -->|Prisma Client| Postgres
    NestAPI -->|Pub/Sub, Caching & Queues| Redis
    NestWorker -->|Queue Worker & Outbox Drain| Redis
    NestWorker -->|State Sync| Postgres

    NestAPI --> Gateways
```

---

## 📁 Repository Layout

```text
usa-limousine-corporation/
├── apps/
│   ├── backend/        # NestJS Core API, WebSockets & BullMQ workers (Port 3000)
│   ├── admin/          # Super Admin Next.js 15 Dashboard (Port 3001)
│   └── customer/       # Customer Next.js 15 Web Portal (Port 3002)
├── packages/
│   └── ui/             # Shared UI Component Library, Tailwind tokens & layout shells
├── docs/               # Enterprise Architecture Decision Records, API Specs & Runbooks
├── deploy/             # VPS Docker Compose configuration, Caddyfile & update scripts
└── tests/              # Cross-workspace Playwright E2E and smoke test suites
```

### Workspace Inventory

| Workspace Directory              | Package Name                          |  Port  | Description                                                    |
| :------------------------------- | :------------------------------------ | :----: | :------------------------------------------------------------- |
| [`apps/backend`](apps/backend)   | `@usa-limousine-corporation/backend`  | `3000` | Core NestJS API, WebSocket gateway, Prisma ORM, BullMQ workers |
| [`apps/admin`](apps/admin)       | `@usa-limousine-corporation/admin`    | `3001` | Platform Super Admin control center                            |
| [`apps/customer`](apps/customer) | `@usa-limousine-corporation/customer` | `3002` | Customer web portal (booking, ride tracking, billing)          |
| [`packages/ui`](packages/ui)     | `@usa-limousine-corporation/ui`       |   —    | Presentation components, design tokens, and shells             |
| [`docs/`](docs)                  | —                                     |   —    | Centralized technical documentation and Postman collections    |
| [`deploy/`](deploy)              | —                                     |   —    | Hostinger VPS deployment automation and Caddy setup            |

---

## 🛠️ Technology Stack

| Layer                  | Technology                                                                   | Specification / Version            | Purpose                                                               |
| :--------------------- | :--------------------------------------------------------------------------- | :--------------------------------- | :-------------------------------------------------------------------- |
| **Package Manager**    | [pnpm](https://pnpm.io/)                                                     | `>= 9.15.9` (Workspaces)           | Fast, deterministic, space-efficient dependency management            |
| **Monorepo Engine**    | [Turborepo](https://turbo.build/repo)                                        | `^2.4.4`                           | Caching, build graph pipeline orchestration                           |
| **Language Baseline**  | [TypeScript](https://www.typescriptlang.org/)                                | `^5.8.2` (Strict)                  | Shared static typing via `tsconfig.base.json`                         |
| **Runtime Pin**        | [Node.js](https://nodejs.org/)                                               | `>= 22.0.0`                        | Runtime execution pinned via `.nvmrc` and `engines`                   |
| **Frontend Framework** | [Next.js](https://nextjs.org/)                                               | `^15.x` (App Router)               | Server components, file-system routing, React 19 baseline             |
| **Backend API**        | [NestJS](https://nestjs.com/)                                                | `^11.x`                            | Enterprise modular backend architecture                               |
| **Database & ORM**     | [PostgreSQL](https://www.postgresql.org/) + [Prisma](https://www.prisma.io/) | PostgreSQL `16-alpine`             | Relational persistence, multi-file schema, type-safe migrations       |
| **Cache & Queues**     | [Redis](https://redis.io/) + [BullMQ](https://bullmq.io/)                    | Redis `7-alpine`                   | High-throughput distributed cache, geospatial indexing, async workers |
| **Realtime Gateway**   | [Socket.IO](https://socket.io/)                                              | `^4.x` (Redis Adapter)             | Low-latency bi-directional event stream for live GPS and chat         |
| **Shared UI**          | Tailwind CSS + Radix UI                                                      | `@usa-limousine-corporation/ui`    | Accessible components, dark/light theme, layout shells                |
| **Code Quality**       | ESLint + Prettier                                                            | ESLint 9 (Flat Config)             | Repository-wide formatting and linting policies                       |
| **Test Frameworks**    | [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/)        | Vitest `^4.x` / Playwright `^1.61` | Fast unit testing and cross-browser E2E verification                  |

---

## 🚀 Getting Started

Follow these steps to bootstrap your local development environment.

### 1. Prerequisites

Ensure your workstation has the following installed:

- **Node.js**: `v22.x` or higher (verified via `.nvmrc`)
- **pnpm**: `v9.x` or higher (`corepack enable`)
- **Docker**: Docker Desktop or Docker Engine (for PostgreSQL & Redis)

### 2. Install Dependencies

Enable corepack to guarantee the correct pnpm binary, then install monorepo dependencies:

```bash
corepack enable
pnpm install
```

### 3. Configure Environment Variables

Copy example `.env` files for each workspace:

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/admin/.env.example apps/admin/.env
cp apps/customer/.env.example apps/customer/.env
```

> [!TIP]
> For local development, default database and Redis connection URLs are pre-configured:
>
> ```ini
> DATABASE_URL=postgresql://postgres:postgres@localhost:5432/usa_limousine_corporation?schema=public
> REDIS_URL=redis://localhost:6379
> ```

### 4. Provision PostgreSQL & Redis

Start local containers using Docker:

```bash
# PostgreSQL 16
docker run -d --name usa-limo-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=usa_limousine_corporation \
  -p 5432:5432 \
  postgres:16-alpine

# Redis 7
docker run -d --name usa-limo-redis \
  -p 6379:6379 \
  redis:7-alpine
```

_To restart existing containers:_

```bash
docker start usa-limo-postgres usa-limo-redis
```

### 5. Run Database Migrations

Apply Prisma schema migrations to the local PostgreSQL database:

```bash
pnpm --filter @usa-limousine-corporation/backend db:migrate:deploy
```

### 6. Start Development Servers

Run the entire platform concurrently via Turborepo:

```bash
pnpm dev
```

#### Application URLs & Port Map

| Application         | Service / Role           | Local URL                                                        | Production URL                       |
| :------------------ | :----------------------- | :--------------------------------------------------------------- | :----------------------------------- |
| **Backend API**     | NestJS Core Gateway      | [http://localhost:3000](http://localhost:3000)                   | `https://api.usalimocorp.com/api/v1` |
| **API Swagger**     | Interactive OpenAPI Docs | [http://localhost:3000/api/docs](http://localhost:3000/api/docs) | _Disabled in production_             |
| **Admin Portal**    | Super Admin Dashboard    | [http://localhost:3001](http://localhost:3001)                   | `https://admin.usalimocorp.com`      |
| **Customer Portal** | Customer Web Portal      | [http://localhost:3002](http://localhost:3002)                   | `https://login.usalimocorp.com`   |

---

## 🧰 Monorepo Scripts

Run standard commands from the repository root:

| Command             | Action                                                        |
| :------------------ | :------------------------------------------------------------ |
| `pnpm dev`          | Starts backend API and all frontend dashboards in watch mode  |
| `pnpm build`        | Compiles and builds all workspaces via Turborepo              |
| `pnpm lint`         | Runs root ESLint Flat Config followed by workspace linting    |
| `pnpm typecheck`    | Validates TypeScript compiler checks across all workspaces    |
| `pnpm format`       | Formats all files automatically using Prettier                |
| `pnpm format:check` | Verifies code formatting compliance without modifying files   |
| `pnpm test`         | Runs unit tests across UI and frontend dashboards via Vitest  |
| `pnpm test:e2e`     | Executes Playwright cross-browser end-to-end smoke test suite |
| `pnpm clean`        | Purges `node_modules` and `.turbo` cache directories          |

---

## 📚 Documentation Index

Explore the comprehensive enterprise documentation portal under [`docs/`](docs):

- 📖 **[Documentation Portal Index](docs/README.md)** — Master technical sitemap and reference index.
- 🏛️ **[System Architecture & Platform Topology](docs/architecture/system-overview.md)** — C4 container diagrams, sub-systems, and queue processing modes.
- 🔐 **[Security & Authentication Architecture](docs/architecture/security-and-auth.md)** — Hybrid JWT + rotating refresh cookie model, double-submit CSRF guards, and RBAC matrix.
- 🎨 **[Frontend Architecture Specifications](docs/frontend-architecture.md)** — Next.js conventions, transport facades, and state caching rules.
- 🌐 **[API Conventions & Envelopes](docs/api/overview.md)** — Standard response contracts, error formats, and Newman CLI integration.
- 🛠️ **[Operations & Deployment Runbooks](docs/operations/runbooks.md)** — Hostinger VPS setup, zero-downtime rolling deploys, database backup/restore, and disaster recovery.
- 📡 **[WebSocket Events Specification](apps/backend/docs/websocket-events.md)** — Real-time Socket.IO event registry, room topologies, and live GPS streaming.
- 🔔 **[Firebase Push Notifications (FCM)](apps/backend/docs/firebase-notifications.md)** — Push notification payloads, device tokens, and delivery gating.
- 💳 **[Payments & Transactional Outbox](apps/backend/docs/payments.md)** — Stripe checkout, off-session renewals, and outbox event drainage.
- 🔑 **[Infrastructure Credentials Guide](apps/backend/docs/guide.md)** — Configuration guide for Stripe, Twilio, Agora, Firebase, and Cloudinary.

---

## 🚢 Production Deployment

The platform is deployed on a dedicated Hostinger VPS running Caddy with automated Let's Encrypt TLS:

- **Hostinger VPS:** `177.7.55.46` (`srv2067905.hstgr.cloud`)
- **Automated CI/CD:** Pushes to `main` execute `.github/workflows/deploy.yml` with selective container rebuilds and automated health smoke tests (`smoke.sh`).
- **Rollback Guarantee:** If post-deployment smoke tests fail, the previous working container images are restored automatically.
- 📖 For complete deployment guides and SSH secrets setup, see [`deploy/README.md`](deploy/README.md) and [`docs/operations/runbooks.md`](docs/operations/runbooks.md).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
