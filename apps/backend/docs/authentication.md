# Backend authentication contract

This document describes the **implemented** authentication system. It does not describe frontend code.

## Architecture

Hybrid session:

1. **Access JWT** is returned in JSON (`data.accessToken`) and sent as `Authorization: Bearer <accessToken>`.
2. **Refresh JWT** is stored only in an **httpOnly** cookie (default name `usa_limo_refresh_token`). It is never returned in JSON.
3. PostgreSQL `Session` stores an **argon2 hash** of the refresh token. Refresh **rotates** the hash; replay revokes the session.
4. Redis is used for **auth email queues**, not session storage.

There is a **single** auth API for all dashboards. There are no per-dashboard Nest controllers.

## Frontend responsibilities

- Keep the access token **in memory only**.
- Send `Authorization: Bearer <accessToken>` on protected routes.
- Send cookies (`credentials: true`) for refresh and other cookie operations.
- Call `GET /api/v1/auth/csrf`, store `data.csrfToken` in memory, send it as `x-csrf-token` on **refresh**.
- Never store the refresh token.
- Never implement authorization (roles, permissions).

## Backend responsibilities

- Authentication, sessions, token rotation, CSRF validation on cookie-authenticated refresh.
- RBAC (`RolesGuard`).
- Password hashing (argon2), lockout, audit logs.

## Access-token flow

`POST /api/v1/auth/login` → `{ success, data: { accessToken, sessionId }, meta }`  
Protected routes: `JwtAuthGuard` → `JwtStrategy` → `ensureAccessSession` (session exists, not revoked, not expired, user active, email verified) → `request.user = { sub, sid, email, roles }`.

WebSocket connect uses the same access JWT + `ensureAccessSession`. Sockets join `user:<id>` and `session:<sid>` (plus role rooms and active `trip:<id>`). Logout/revoke disconnects matching sockets (`auth:session_revoked`). Clients should reconnect after refresh with a new access token. Live trip GPS: see [websocket-events.md](./websocket-events.md) (`driver.location`).

JWT payload is only `{ sub, email, sid }`. Roles are loaded from the database on each request.

## Refresh-token flow

`POST /api/v1/auth/refresh` with:

- refresh cookie **or** `Authorization: Bearer <refreshToken>`
- CSRF cookie **and** `x-csrf-token` header (double-submit)

Response JSON again contains only `{ accessToken, sessionId }`. A new refresh cookie is set.

Native/mobile clients that cannot rely on browser cookies may call refresh with `Authorization: Bearer <refreshToken>` **without CSRF** when no refresh cookie is sent. The refresh token itself is **not** returned in login/refresh JSON; clients obtain it from the httpOnly cookie on first login (e.g. WebView cookie jar) or must use the cookie-based refresh flow in browser dashboards.

## CSRF

Cookie-authenticated **state-changing** operation today: **refresh** when the refresh JWT is sent in the httpOnly cookie.

`CsrfGuard` runs **before** `RefreshAuthGuard` on `POST /auth/refresh`. Cookie refresh with a missing or mismatched CSRF pair fails closed with 403 (`CSRF token invalid`) and does not proceed to refresh-token verification. Failures do not log tokens, cookies, or Authorization headers.

**Rule:** any future state-changing endpoint that authenticates through a **browser-attached cookie** MUST use `CsrfGuard`. Do not apply `CsrfGuard` globally.

COOKIE AUTH (browser sends the secret automatically):

```
POST /some-cookie-authenticated-mutation
Cookie: usa_limo_refresh_token=...
→ CsrfGuard required
```

BEARER AUTH (browser does not attach Authorization by itself):

```
POST /auth/logout
Authorization: Bearer <accessToken>
→ CSRF not required
```

Bearer-only routes (logout, logout-all, change-password, `/auth/me`, domain APIs) **do not** require CSRF. Refresh with `Authorization: Bearer <refreshToken>` and **no** refresh cookie also skips CSRF. If the refresh cookie is present, CSRF is required even when a Bearer header is also sent.

The CSRF header name is **only** `AUTH_CSRF_HEADER_NAME` (default `x-csrf-token`, lowercased at runtime). There is no second hardcoded constant.

`GET /api/v1/auth/csrf` (throttled like other auth abuse endpoints, 30/min outside test):

- Sets `usa_limo_csrf_token` (httpOnly, same Secure/SameSite/Path/Domain as the refresh cookie, **different name**).
- Returns `{ csrfToken }` in JSON so a cross-origin dashboard can send the header (JS cannot read the API host cookie). The JSON value is the same string as the cookie.

The refresh cookie remains httpOnly and is **not** the CSRF cookie.

## Current user

`GET /api/v1/auth/me` (Bearer access JWT):

```json
{
  "id": "...",
  "name": "Super Admin",
  "email": "...",
  "phone": null,
  "roles": ["CUSTOMER"],
  "isEmailVerified": true,
  "isActive": true,
  "createdAt": "...",
  "sessionId": "...",
  "avatar": null
}
```

`name` is returned from `User.name` or fallback to the linked driver profile's full name.
`phone` is returned from `User.phone` or fallback to the linked driver profile's phone number.
`avatar` comes from `User.avatar` or fallback to the linked driver profile's `avatarUrl`. It is `null` when no profile image is set.

Password hashes and refresh hashes are never returned.

## Session model

`Session`: `userId`, `deviceId` (from `x-device-id` or `unknown-device`), hashed refresh token, expiry, `revokedAt`.

Login creates a new session and **revokes all other active sessions** for that user (single active session). Logout revokes the current session. Logout-all, password reset, and change-password revoke **all** sessions.

## Cookies (environment-driven)

| Setting  | Refresh cookie                                    | CSRF cookie                                      |
| -------- | ------------------------------------------------- | ------------------------------------------------ |
| Name     | `AUTH_COOKIE_NAME` or `usa_limo_refresh_token`    | `AUTH_CSRF_COOKIE_NAME` or `usa_limo_csrf_token` |
| httpOnly | default true (`AUTH_COOKIE_HTTP_ONLY`)            | always true                                      |
| secure   | default true in production                        | same as refresh                                  |
| sameSite | `AUTH_COOKIE_SAME_SITE` (default strict if unset) | same as refresh                                  |
| path     | `AUTH_COOKIE_PATH` or `/`                         | same                                             |
| domain   | optional `AUTH_COOKIE_DOMAIN`                     | same                                             |
| maxAge   | `JWT_REFRESH_TTL_SECONDS`                         | same                                             |

Production refuses `AUTH_COOKIE_SECURE=false` and `AUTH_COOKIE_HTTP_ONLY=false`. `AUTH_COOKIE_SAME_SITE` must be `lax`, `strict`, or `none` (invalid values fail validation; they are not coerced). `SameSite=None` in production requires Secure.

### Production topology

Dashboards: `https://admin.usalimocorp.com`, `https://login.usalimocorp.com`  
API: `https://api.usalimocorp.com`

Host-only cookies on the API host are sent on credentialed cross-origin calls to the API. Parent-domain `AUTH_COOKIE_DOMAIN` is optional. Same-site (`usalimocorp.com`) works with Lax/Strict. Unrelated sites would need `SameSite=None; Secure`.

## CORS

`credentials: true`. `CORS_ORIGIN` / `WS_CORS_ORIGIN` are comma-separated allowlists.

Local dashboards (example): `http://localhost:3001,http://localhost:3002`.

Production **must not** use `*`. Startup validation fails if it does.

## Auth endpoints

| Method | Path                            | Auth                  | CSRF         |
| ------ | ------------------------------- | --------------------- | ------------ |
| GET    | `/api/v1/auth/csrf`             | public                | issues token |
| GET    | `/api/v1/auth/me`               | Bearer                | no           |
| POST   | `/api/v1/auth/register`         | public                | no           |
| POST   | `/api/v1/auth/login`            | public                | no           |
| POST   | `/api/v1/auth/refresh`          | refresh cookie/Bearer | **yes**      |
| POST   | `/api/v1/auth/logout`           | Bearer                | no           |
| POST   | `/api/v1/auth/logout-all`       | Bearer                | no           |
| POST   | `/api/v1/auth/verify-email`     | public                | no           |
| POST   | `/api/v1/auth/resend-otp`       | public                | no           |
| POST   | `/api/v1/auth/forgot-password`  | public                | no           |
| POST   | `/api/v1/auth/verify-reset-otp` | public                | no           |
| POST   | `/api/v1/auth/reset-password`   | public                | no           |
| POST   | `/api/v1/auth/change-password`  | Bearer                | no           |

Password reset (mobile-friendly):

1. `POST /auth/forgot-password` `{ email }` → emails a 6-digit OTP (10 min).
2. `POST /auth/verify-reset-otp` `{ email, otp }` → returns one-time `resetToken` (15 min).
3. `POST /auth/reset-password` `{ email, resetToken, newPassword }` → sets password and revokes sessions.

Responses use the global `{ success, data, meta }` envelope. Errors use `{ success: false, error: { statusCode, message, error, timestamp, path } }`.

Register / login / forgot / resend-otp do not require UI-only fields (`rememberMe`, `name`, `terms`). Extra properties are rejected (`forbidNonWhitelisted`).

Public register assigns `CUSTOMER` only.

## Rate limits

Auth routes are **not** IP-throttled. There is no `ThrottlerGuard` and no `@Throttle` on `AuthController`.

Login brute-force protection is **account lockout** only (`AUTH_LOGIN_MAX_ATTEMPTS`, `AUTH_LOCKOUT_MINUTES`, `failedLoginCount`).

Other API modules may still use `ThrottlerGuard` independently. That does not apply to `/api/v1/auth/*`.

## RBAC

HTTP RBAC is `@Roles` + `RolesGuard`. Permission keys exist in the database but are not an HTTP guard.
