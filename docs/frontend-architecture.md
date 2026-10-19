# Frontend dashboard architecture

This document describes the **current** frontend architecture. It does not describe authentication, domain APIs, or query hooks that are not implemented.

## Applications

Independently deployable Next.js applications:

- `apps/admin`
- `apps/customer`

There are **no** app-to-app imports.

## Shared packages

- `@usa-limousine-corporation/ui` is the only shared frontend package. It is presentation and design-system infrastructure (components, shell, theme, form primitives).
- `@usa-limousine-corporation/ui` contains **no** Axios, **no** HTTP clients, **no** TanStack Query, **no** authentication orchestration, and **no** domain/business API logic.

Packages that **do not exist** and are not part of this phase:

- `@usa-limousine-corporation/api`
- `@usa-limousine-corporation/query`
- `@usa-limousine-corporation/types`
- `@usa-limousine-corporation/config`

A shared HTTP or Query package may be considered later **only** if real duplication (not domain endpoints) proves it necessary.

## HTTP transport

Each dashboard owns Axios internally and exposes a small `http` facade:

- `apps/admin/lib/http/`
- `apps/customer/lib/http/`

Feature code uses:

```ts
import { http } from "../lib/http/client";

const result = await http.get<MyType>("/endpoint", { signal });
```

`http` methods return the response **payload** (`response.data`), not an Axios response object. The payload is not unwrapped from a success/message envelope.

Rules:

- Transport-only: no domain endpoints, organizations, bookings, drivers, RBAC, or tenant logic.
- `withCredentials` is enabled for a future cookie-auth phase.
- Timeout is 30 seconds (`DEFAULT_HTTP_TIMEOUT_MS`).
- JSON requests use Axios JSON defaults. `Accept: application/json` is set. FormData bodies do not force `Content-Type: application/json`.
- `AbortSignal` is supported via request config (`signal`) for TanStack Query cancellation.
- Errors are thrown as `HttpError` (status, code, canceled, timeout, method, url). Response bodies and credentials are not copied onto the error.
- There is no Bearer token, refresh, login, logout, CSRF, or `/me` handling. Backend CSRF is not defined in the current backend sources; a CSRF interceptor can be added later without changing `http.get/post/...`.

## TanStack Query

Each application owns a QueryClient and provider:

- `apps/admin/providers/query-provider.tsx`
- `apps/customer/providers/query-provider.tsx`

Root layout composition:

`QueryProvider` → `UiProviders` → application

Defaults (conservative, not domain-specific):

- queries: `retry: 1`, `staleTime: 60_000`, `gcTime: 5 * 60_000`, `refetchOnWindowFocus: false`
- mutations: `retry: 0`

Query keys, domain hooks, and mutations are **not** implemented.

## Environment

Canonical API base URL variable (same name, independently set per app):

`NEXT_PUBLIC_API_BASE_URL`

Example (see each app's `.env.example`):

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_APP_ENV=development
```

Do not use `NEXT_PUBLIC_API_URL`. Do not commit `.env` files.

If `NEXT_PUBLIC_API_BASE_URL` is missing, the HTTP module fails instead of using an undefined base URL.

## Domain APIs

**Not implemented.** Domain API modules and query hooks will live inside the owning dashboard (for example a future `apps/admin/features/...` module), not in `@usa-limousine-corporation/ui` and not in a shared API package.

## Independent deployment

Sharing `@usa-limousine-corporation/ui` at **build time** does not mean a shared runtime. Each dashboard still builds and deploys as its own Next.js application with its own `http` client, its own QueryClient, and its own `NEXT_PUBLIC_API_BASE_URL`.
