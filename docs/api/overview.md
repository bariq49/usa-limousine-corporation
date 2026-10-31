# API Conventions & Integration Standards

The USA Limousine Corporation platform exposes a standardized RESTful API and real-time WebSocket gateway designed for consistency, strict validation, and seamless integration across web dashboards and mobile applications.

---

## 🌐 API Endpoints & Versioning

All HTTP endpoints are versioned through URI path prefixes:

- **Local Development:** `http://localhost:3000/api/v1`
- **Production Host:** `https://api.usalimocorp.com/api/v1`
- **Interactive Swagger Documentation:** `http://localhost:3000/api/docs` (disabled in production)

---

## 📋 Response Envelopes & Error Formatting

Every API endpoint enforces consistent serialization and error handling via NestJS global interceptors and exception filters.

### 1. Success Response Envelope

All non-binary successful responses conform to the standard triple-envelope contract:

```json
{
  "success": true,
  "data": {
    "id": "cm12345abcde",
    "bookingNumber": "BK-2026-0001",
    "status": "CONFIRMED",
    "pricing": {
      "baseFare": 50.0,
      "distanceFare": 35.0,
      "tax": 7.5,
      "total": 92.5
    }
  },
  "meta": {
    "timestamp": "2026-10-18T23:30:00.000Z",
    "requestId": "req-987654321",
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalItems": 1,
      "totalPages": 1
    }
  }
}
```

### 2. Standardized Error Envelope

Validation failures, unauthorized access, and system exceptions return structured, RFC-7807 aligned error representations:

```json
{
  "success": false,
  "error": {
    "statusCode": 400,
    "message": [
      "pickupDate must be a valid ISO 8601 date string",
      "passengerCount must not be less than 1"
    ],
    "error": "Bad Request",
    "timestamp": "2026-10-18T23:30:00.000Z",
    "path": "/api/v1/customers/bookings"
  }
}
```

### Common HTTP Status Codes

| Code  | Status              | Meaning                                 | Typical Scenario                                   |
| :---: | :------------------ | :-------------------------------------- | :------------------------------------------------- |
| `200` | OK                  | Request succeeded                       | Standard data retrieval or update                  |
| `201` | Created             | Resource successfully created           | Booking created, registration complete             |
| `400` | Bad Request         | Validation failure / invalid payload    | Class-validator constraints violated               |
| `401` | Unauthorized        | Missing or expired token                | Invalid JWT or missing Authorization header        |
| `403` | Forbidden           | Insufficient permissions / CSRF invalid | Non-admin accessing admin route, CSRF mismatch     |
| `404` | Not Found           | Resource does not exist                 | Invalid booking ID, unknown entity                 |
| `409` | Conflict            | Business logic or uniqueness conflict   | Email already registered, concurrent booking claim |
| `429` | Too Many Requests   | Rate limit exceeded                     | Abuse detection or brute force limit hit           |
| `503` | Service Unavailable | Critical infrastructure outage          | Primary PostgreSQL database connection lost        |

---

## 🔑 Authentication Headers & Cookies

Requests to protected routes must include valid authorization headers or credentials:

```http
GET /api/v1/auth/me HTTP/1.1
Host: api.usalimocorp.com
Authorization: Bearer <accessToken>
x-device-id: usa_limo_device_d9f8a2
```

For cookie-authenticated mutations (token refresh):

```http
POST /api/v1/auth/refresh HTTP/1.1
Host: api.usalimocorp.com
x-csrf-token: <csrfToken>
Cookie: usa_limo_refresh_token=<refreshToken>; usa_limo_csrf_token=<csrfToken>
```

---

## 🗂️ API Functional Modules

| Module Prefix       | Target Audience        | Primary Responsibilities                                                              |
| :------------------ | :--------------------- | :------------------------------------------------------------------------------------ |
| `/api/v1/auth`      | Public & Authenticated | Login, registration, OTP email/SMS verification, token refresh, password resets       |
| `/api/v1/customers` | Registered Customers   | Booking requests, price quotes, ride tracking, review submission, notifications       |
| `/api/v1/drivers`   | Verified Drivers       | Profile & shift management, live trip GPS streaming, wallet balances, payout requests |
| `/api/v1/admin`     | Platform Super Admins  | Driver document approvals, vehicle categories, financial payout execution, audit logs |
| `/api/v1/payments`  | Webhooks               | Square payment webhook (`POST /payments/square/webhook`); guest checkout lives under `/public/bookings/checkout` |
| `/api/v1/chat`      | Trip Participants      | Trip-scoped secure text messaging, typing indicators, read receipts                   |
| `/api/v1/health`    | Monitoring / DevOps    | Comprehensive deep health probe (PostgreSQL, Redis, BullMQ, storage, email)           |

---

## 🧪 Postman Collection & Integration Testing

The repository includes a production-grade Postman collection for automated testing, API exploration, and regression validation:

- **Collection File:** [`docs/USA Limousine Corporation API.postman_collection.json`](../USA%20Limousine%20Corporation%20API.postman_collection.json)
- **Features Included:**
  - Automated environment variable management (persists `accessToken`, `csrfToken`, `bookingId`, `tripId`)
  - End-to-end user journeys (Register ➔ Verify OTP ➔ Login ➔ Book Ride ➔ Driver Dispatch ➔ Complete Trip)
  - Pre-request scripts and automated response schema validations

### Executing with Newman (CLI)

Run the full integration test suite via Newman from your terminal:

```bash
# Install newman if needed
pnpm add -g newman

# Execute integration suite against local backend
newman run "docs/USA Limousine Corporation API.postman_collection.json" \
  --env-var "baseUrl=http://localhost:3000/api/v1" \
  --bail
```

---

## 📡 Real-Time WebSocket Specifications

For deep specifications on Socket.IO events, payloads, and room subscriptions, consult the following dedicated references:

- **[WebSocket Events Specification](../../apps/backend/docs/websocket-events.md)** — Event index, payload schemas, GPS tracking channels, and ride chat lifecycle.
- **[Payments (Square)](../../apps/backend/docs/payments.md)** — Guest checkout, webhook settling, payment records and checkout expiry.
