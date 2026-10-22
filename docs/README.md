# USA Limousine Corporation — Technical Documentation

Welcome to the enterprise technical documentation for the USA Limousine Corporation platform. This documentation portal provides architects, engineers, and DevOps professionals with comprehensive guides, specifications, and operational runbooks for the entire monorepo ecosystem.

---

## 🗺️ Documentation Architecture

```text
docs/
├── README.md                                         # Documentation index & navigation portal (this file)
├── frontend-architecture.md                          # Next.js frontend architecture & HTTP transport specs
├── architecture/
│   ├── system-overview.md                            # End-to-end platform topology, C4 diagrams, and sub-systems
│   └── security-and-auth.md                          # Auth contract, JWT + refresh cookie rotation, CSRF, RBAC
├── api/
│   └── overview.md                                   # REST API conventions, envelopes, WebSocket & Postman guide
├── operations/
│   └── runbooks.md                                   # VPS deployment, database migrations, CI/CD, and incident response
└── USA Limousine Corporation API.postman_collection.json # Production Postman integration collection
```

---

## 📚 Core Documentation Index

### 1. System Architecture

- **[System Architecture & Platform Topology](architecture/system-overview.md)**  
  End-to-end system context, component topology, multi-file Prisma schema, Redis geospatial dispatch, and BullMQ worker isolation.
- **[Frontend Architecture Specifications](frontend-architecture.md)**  
  Next.js App Router conventions, shared presentation UI package (`@usa-limousine-corporation/ui`), internal HTTP facades, and TanStack Query lifecycle.
- **[Security & Authentication Architecture](architecture/security-and-auth.md)**  
  In-depth security model: Access JWT, rotating httpOnly refresh tokens, double-submit cookie CSRF guards, Argon2 hashing, and RBAC matrix.

### 2. API & Integration Specifications

- **[API Overview & Protocols](api/overview.md)**  
  REST API conventions, standard response envelopes (`{ success, data, meta }`), error structures, WebSocket real-time rooms, and Postman collection usage.
- **[WebSocket Events Specification](../apps/backend/docs/websocket-events.md)**  
  Complete Socket.IO event registry, room topologies, live trip GPS tracking (`driver.location`), offer marketplace, and ride chat.
- **[Push Notifications Specification (FCM)](../apps/backend/docs/firebase-notifications.md)**  
  Firebase Cloud Messaging payload definitions, device registration, notification types, and delivery gating.
- **[Payment & Webhook Outbox Specification](../apps/backend/docs/payments.md)**  
  Stripe Checkout, saved payment methods, off-session renewal charges, and transactional outbox event delivery.

### 3. Operations & Infrastructure

- **[Operations & Deployment Runbooks](operations/runbooks.md)**  
  Hostinger VPS architecture (`177.7.55.46`), GitHub Actions CI/CD workflows, selective container builds, zero-downtime rolling updates, and rollback procedures.
- **[VPS Deployment Setup Guide](../deploy/README.md)**  
  Hostinger VPS host configuration, Caddy reverse proxy, DNS records, SSH deployment keys, and production environment provisioning.
- **[Infrastructure Credentials Guide](../apps/backend/docs/guide.md)**  
  Provisioning guide for third-party integrations: Stripe, Twilio SMS, Agora RTC, Firebase Admin SDK, Cloudinary, and SMTP mailers.
- **[Prisma Schema Organization](../apps/backend/prisma/schema/README.md)**  
  Domain-split Prisma schema design patterns and migration rules.

---

## 🏛️ Platform Quick Reference

| Dimension                  | Specification                                               |
| :------------------------- | :---------------------------------------------------------- |
| **Production Domain**      | `https://www.usalimocorp.com` / `https://usalimocorp.com`   |
| **API Base URL**           | `https://api.usalimocorp.com/api/v1`                        |
| **WebSocket Gateway**      | `wss://api.usalimocorp.com` (shares port 3000 behind Caddy) |
| **Admin Dashboard**        | `https://admin.usalimocorp.com`                             |
| **Customer Portal**        | `https://customer.usalimocorp.com`                          |
| **Hosting Infrastructure** | Hostinger VPS (`177.7.55.46`, `srv2067905.hstgr.cloud`)     |
| **Primary Database**       | PostgreSQL 16 (`usa_limousine_corporation`)                 |
| **Cache & Message Broker** | Redis 7 (`redis://localhost:6379`)                          |
| **Monorepo Engine**        | Turborepo + pnpm Workspaces                                 |
| **Runtime Pin**            | Node.js `>= 22.0.0`                                         |
