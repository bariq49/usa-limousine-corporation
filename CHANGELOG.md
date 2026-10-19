# Changelog

All notable changes to the USA Limousine Corporation enterprise platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.1.0] — 2026-10-18

### Changed

- **Enterprise Documentation Standardization:** Restructured monorepo documentation to enterprise architectural standards:
  - Created centralized [`docs/README.md`](docs/README.md) documentation index.
  - Authored [`docs/architecture/system-overview.md`](docs/architecture/system-overview.md) with C4 diagrams and sequence flows.
  - Authored [`docs/architecture/security-and-auth.md`](docs/architecture/security-and-auth.md) covering hybrid JWT + rotating httpOnly refresh tokens and CSRF guards.
  - Authored [`docs/api/overview.md`](docs/api/overview.md) detailing REST envelopes, error models, and Newman CLI runner commands.
  - Authored [`docs/operations/runbooks.md`](docs/operations/runbooks.md) detailing Hostinger VPS procedures, backup/restore, and disaster recovery.
  - Elevated root [`README.md`](README.md) to modern enterprise standard with accurate port maps, Docker setup, and directory topologies.
- **Documentation Hygiene:**
  - Removed obsolete `.github/README.md`.
  - Updated [`apps/README.md`](apps/README.md) to document backend, admin, and customer apps.
  - Cleaned legacy container names and outdated port references across all documentation files.

---

## [2.0.0] — 2026-10-18

### Added

- **Customer Web Portal (`apps/customer`):** Migrated and refactored staff portal to dedicated customer web portal (`@usa-limousine-corporation/customer`) on port 3002.
- **Production Hostinger VPS Deployment:** Provisioned Hostinger VPS `177.7.55.46` (`srv2067905.hstgr.cloud`) with Caddy automated TLS reverse proxy for `*.usalimocorp.com`.
- **Database Rebranding & Isolation:** Configured dedicated PostgreSQL database `usa_limousine_corporation` and test database `usa_limousine_corporation_test` with user `usa_limo`.
- **Branded Security Cookies:** Updated authentication cookies to `usa_limo_refresh_token` and `usa_limo_csrf_token` with device ID `usa_limo_device_id`.
- **Full Test Suite Verification:** 100% pass across Vitest (54/54 tests), Jest unit tests (219/219 tests), strict TypeScript compilation, and ESLint Flat Config.

### Removed

- **Agency Dashboard Decommissioned:** Completely removed `apps/agency` and associated tenant dashboard logic to focus on direct customer bookings and centralized platform dispatch.
- **Legacy Domain & Entity References:** Purged all legacy domain strings (`amsairporttaxi.nl`, `ams_taxi`, `ams-taxi`) across backend modules, frontend clients, tests, environment configurations, and Postman collections.

---

## [1.5.0] — 2026-09-15

### Added

- **Real-Time Dispatch & WebSockets:** Integrated Socket.IO with Redis adapter for real-time driver tracking (`driver.location`), vehicle category broadcasting, and ride chat.
- **Transactional Payment Outbox:** Stripe webhook events processed with database idempotency (`PaymentWebhookEvent`) and transactional outbox pattern via BullMQ workers.
- **Driver Financials & Payouts:** Automated driver wallet tracking, trip completion credits, and multi-stage payout request lifecycle (`PENDING` ➔ `APPROVED` ➔ `PROCESSING` ➔ `PAID`).
- **Firebase Push Notifications (FCM):** Multi-device FCM token resolution and background notification delivery for booking offers, trip status updates, and support messages.

---

## [1.0.0] — 2026-08-04

### Added

- **Monorepo Foundation:** Initialized Turborepo monorepo with pnpm workspaces, strict TypeScript baseline (`tsconfig.base.json`), ESLint Flat Config, and Prettier.
- **Backend Architecture:** Modular NestJS 11 backend shell with PostgreSQL 16 via Prisma ORM, Redis 7 caching, and BullMQ queue services.
- **Shared UI Package:** Presentation component library (`packages/ui`) with Tailwind CSS and Radix UI primitives.
- **CI Automation:** GitHub Actions CI workflow for linting, typechecking, and unit tests.
