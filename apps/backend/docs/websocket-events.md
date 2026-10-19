# WebSocket events

Socket.IO events. Auth: access JWT (`auth.token` or `Authorization: Bearer`).

Rooms: `user:<id>`, `session:<sid>`, `driver:<id>`, `drivers:online`, `drivers:cat:<categoryId>`, `ops:fleet`, `trip:<tripId>`, `chat:<conversationId>`.

JWT required on connect (no guest offer-watch). Customers receive marketplace events on `user:<id>`.

### Socket.IO events (index)

`auth:session_revoked`
`driver.presence.updated`
`driver.fleet.updated`
`driver.location`
`trip.call`
`notification.created`
`driver.notification.created`
`wallet.credited`
`driver.wallet.credited`
`booking.available`
`booking.taken`
`offer.request`
`offer.created`
`offer.updated`
`offer.result`
`offer.session_expired`
`chat.join`
`chat.message.send`
`chat.message.created`
`chat.message.delivered`
`chat.message.read`
`chat.typing`
`chat.conversation.opened`
`chat.conversation.closed`

### Inbox / FCM `NotificationType` (index)

Delivered on `notification.created` (user) or `driver.notification.created` (driver), plus optional FCM. See [firebase-notifications.md](./firebase-notifications.md).

`BOOKING_AVAILABLE`
`BOOKING_UNAVAILABLE`
`OFFER_RECEIVED`
`OFFER_ACCEPTED`
`TRIP_ACCEPTED`
`TRIP_STATUS_UPDATED`
`TRIP_COMPLETED`
`TRIP_CANCELLED`
`CHAT_MESSAGE`
`WALLET_CREDITED`
`TICKET_STATUS_UPDATED`
`TICKET_REPLY`
`TICKET_RESOLVED`
`APPLICATION_UNDER_REVIEW`
`APPLICATION_APPROVED`
`SUBSCRIPTION_ACTIVATED`
`SUBSCRIPTION_TRIAL_ENDING`
`SUBSCRIPTION_PAYMENT_FAILED`
`SUBSCRIPTION_PAST_DUE`
`SUBSCRIPTION_EXPIRED`
`SUBSCRIPTION_PLAN_CHANGED`
`SUBSCRIPTION_CANCEL_SCHEDULED`
`SUBSCRIPTION_RESUMED`
`PAYOUT_SUBMITTED`
`PAYOUT_APPROVED`
`PAYOUT_PAID`
`PAYOUT_REJECTED`
`PAYOUT_CANCELLED`

### Offer marketplace payload `type` (inside WS bodies)

Used in `booking.available` / `booking.taken` / `offer.*` payloads (not separate Socket.IO event names).

`BOOKING_AVAILABLE`
`BOOKING_TAKEN`
`BOOKING_DECLINED`
`BOOKING_QUOTED`
`BOOKING_PRICE_UPDATED`
`OFFER_REQUEST`
`OFFER_CREATED`
`OFFER_ACCEPTED`
`OFFER_DECLINED`
`OFFER_WITHDRAWN`
`OFFER_SUPERSEDED`
`OFFER_SESSION_CANCELLED`
`OFFER_SESSION_EXPIRED`

## Auth

- `auth:session_revoked`

## Presence

- `driver.presence.updated` → `driver:<id>` (that driver)
- `driver.fleet.updated` → `ops:fleet` (SUPER_ADMIN / EMPLOYEE live map)

Payload includes online status, shift session, `lastLat` / `lastLng`, `vehicleCategoryId`.

Presence heartbeat (REST) requires `lat` / `lng` and updates coarse location for **fleet/map** (Postgres + Redis GEO). It does **not** keep-or-drop online status — a driver stays `ONLINE` until they call Offline (`PATCH /drivers/presence` with `online: false`). High-frequency trip GPS uses the live location channel below — Redis latest + batched Postgres history (not every ping written live).

Going online and heartbeat both require `lat` / `lng` so the map has a last known point.

## Live trip location

Driver publishes every 3–10s while a trip is active (mobile app tracking to pickup / during trip). **Customers** track the same feed (not presence heartbeat).

| Store                              | Role                                                   |
| ---------------------------------- | ------------------------------------------------------ |
| Redis `trip:{id}:location`         | Latest point (TTL 60s)                                 |
| Redis GEO `drivers:geo`            | Fleet map                                              |
| Redis buffer → `TripLocationPoint` | Batched history (flush every 25 points or on trip end) |

### Client → server

| Event             | Who                   | Body                                                            |
| ----------------- | --------------------- | --------------------------------------------------------------- |
| `driver.location` | driver of active trip | `{ tripId, lat, lng, heading?, speed?, accuracy?, timestamp? }` |

Ack: `{ ok: true, payload? }` or `{ ok: false, error }`.

Guards:

- trip belongs to this driver and status is active
- min interval ~2.5s per driver
- timestamp not older than ~30s
- optional `accuracy` must be ≤ 100 when sent

### Server → client

| Event             | Rooms                        |
| ----------------- | ---------------------------- |
| `driver.location` | `trip:<tripId>`, `ops:fleet` |

Payload:

```json
{
  "tripId": "t_123",
  "driverId": "d_456",
  "lat": 52.3105,
  "lng": 4.7683,
  "heading": 120,
  "speed": 14.2,
  "accuracy": 8,
  "timestamp": 1724410000123
}
```

### Customer tracking

| Path                                        | Who                  | Notes                                                                                                                                                                                                                |
| ------------------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Socket `driver.location` on `trip:<tripId>` | booking customer     | Live pin (same event as ops)                                                                                                                                                                                         |
| `GET /customers/trips/:id/location`         | booking customer JWT | Map screen bootstrap: trip + driver + vehicle + booking + `driverLocation` + `etaMinutes`. Prefer socket for live pin updates; poll this for cold start / reconnect. `driverLocation.stale: true` if Redis miss/old. |

Presence heartbeat remains **fleet/online only** — do not use it for passenger map.

### Audio call (Agora)

Same lifecycle window as ride chat: available only after **Start Ride** (`STARTED` … `ARRIVED_AT_DROPOFF`).

| Path                             | Who          |
| -------------------------------- | ------------ |
| `POST /trips/:id/call`           | driver JWT   |
| `POST /customers/trips/:id/call` | customer JWT |

Response: `{ tripId, appId, channel, uid, token, role, expiresAt, mode: "audio" }`. Channel is `trip:{tripId}`. Clients join with Agora RTC SDK (audio).

| Event       | Rooms                                     | When                                          |
| ----------- | ----------------------------------------- | --------------------------------------------- |
| `trip.call` | `trip:<id>`, `user:<peer>`, `driver:<id>` | Caller minted a token — payload `CALL_INVITE` |

Peer should call their own token endpoint, then join the same channel. Fill `AGORA_APP_ID` / `AGORA_APP_CERTIFICATE` (see [guide.md](./guide.md)).

### Room membership

- On connect: auto-join `trip:<id>` for the driver’s **and booking customer’s** active trips
- On trip accept (`POST /trips`): driver + customer join `trip:<id>`
- On complete / cancel: leave trip room, flush history buffer, delete Redis keys
- Ops receives updates on `ops:fleet`

## Notifications (inbox)

| Event                         | Room          | When                                              |
| ----------------------------- | ------------- | ------------------------------------------------- |
| `notification.created`        | `user:<id>`   | New inbox notification for a **user** recipient   |
| `driver.notification.created` | `driver:<id>` | New inbox notification for a **driver** recipient |

Payload: `{ id, type, title, body, data, createdAt, readAt }`.

Drivers receive only `driver.notification.created` (not both). Users receive only `notification.created`.

For push / lock-screen delivery, see [firebase-notifications.md](./firebase-notifications.md).

**Delivery order:** DB inbox row → WebSocket → optional FCM (`push` flag; drivers via `Driver.fcmToken`, customers via `Customer.fcmToken` + push settings).

## Offer marketplace (logged-in customer)

Auth: customer JWT. Create seeking booking with `POST /customers/bookings` → status `SEEKING_OFFERS`. Listen on `user:<customerUserId>` (joined automatically on connect).

Drivers go online for their vehicle category room `drivers:cat:<categoryId>`, then use `GET /offers/available` (poll fallback) or listen for realtime below.

### Flow

1. Customer creates booking → `OfferService.startSeeking` → `NotifyService.available` (category WS + FCM) + match dispatch job
2. Nearby matched drivers also get `offer.request` on `driver:<id>` (WS only; no second FCM)
3. Driver submits quote → customer gets `offer.created` + FCM `OFFER_RECEIVED`; quoting driver gets `offer.result` `BOOKING_QUOTED` (remove from their available). Other drivers keep the card.
4. Customer may raise fair price → `POST /customers/bookings/:id/counter` → category `booking.available` + FCM `BOOKING_AVAILABLE` (excludes drivers who already quoted) + tracked drivers `offer.request` `BOOKING_PRICE_UPDATED`
5. Customer accepts → category `booking.taken` + FCM `BOOKING_UNAVAILABLE` (others) + FCM `OFFER_ACCEPTED` (winner) → checkout → after pay, trip created → `booking.taken` again with `tripId`
6. Payment timeout / failed payment reopens seeking → `NotifyService.available` again

Customer REST helpers: `GET /customers/bookings/current` and `GET /customers/bookings/:id` return `{ booking, offers }`.

| Event                   | Room                       | Who                            | When                                                                                          |
| ----------------------- | -------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------- |
| `booking.available`     | `drivers:cat:<categoryId>` | all online drivers in category | Seeking started / payment reopen / **price counter** — add or refresh available card          |
| `offer.request`         | `driver:<id>`              | geo-matched / tracked drivers  | Match dispatch / radius expand / **price counter** / **relist after quote decline or expire** |
| `offer.created`         | `user:<id>`                | booking owner                  | Driver submitted a quote                                                                      |
| `offer.updated`         | `user:<id>`                | booking owner                  | Quote withdrawn / declined / accepted                                                         |
| `offer.result`          | `driver:<id>`              | tracked / quoted drivers       | Accept / decline / session end / taken / available decline / **`BOOKING_QUOTED`**             |
| `offer.session_expired` | `user:<id>`                | booking owner                  | Seeking session timed out or cancelled                                                        |
| `booking.taken`         | `drivers:cat:<categoryId>` | all online drivers in category | **Customer accepted offer** (awaiting payment) and marketplace paid / trip created            |

Driver dismisses an available ride: `POST /offers/available/:bookingId/decline` → row in `DriverBookingDecline` (hidden only for that driver) + `offer.result` `{ type: "BOOKING_DECLINED", payload: { bookingId } }` on `driver:<id>`. Does **not** emit `booking.taken` (other drivers keep the card).

**`booking.available` payload** (same fields as `GET /offers/available` items):

```json
{
  "type": "BOOKING_AVAILABLE",
  "payload": {
    "id": "cm…",
    "bookingNumber": "BK-100",
    "pricing": { "total": 80 },
    "address": { "pickup": {}, "dropoff": {}, "distance": 12.5, "duration": 25 },
    "bookingTime": { "pickupDate": "2026-10-16", "pickupTime": "14:00" },
    "passenger": { "passengerCount": 2 },
    "vehicleCategoryId": "cm…",
    "offerSessionExpiresAt": "2026-10-16T12:30:00.000Z",
    "matchingRadius": 8,
    "createdAt": "2026-10-16T12:00:00.000Z"
  }
}
```

UI: countdown to `offerSessionExpiresAt`; remove the card when it hits zero, or on `booking.taken` / session end.

FCM for available/taken: [firebase-notifications.md](./firebase-notifications.md).

## Ride chat (text-only V1)

Centralized Chat Module. Conversations are keyed by `User.id` participants. Ride chat is the first subject (`subjectType=TRIP`).

**Lifecycle (backend-enforced):**

1. Trip accepted / paid — chat **not** available.
2. Driver `POST /trips/:id/start` succeeds → `STARTED` → conversation `ACTIVE` + `chat.conversation.opened`.
3. Participants exchange text via REST `/chat/*` or Socket.IO `chat.*`. Reconnect: `chat.join` + `GET …/messages?after=<lastMessageId>` to gap-fill.
4. Trip `COMPLETED` / `CANCELLED` → leave `chat:` rooms, delete conversation + messages, emit `chat.conversation.closed` (no history retained).
5. Send/typing rate limits: 60 send / 30 typing per user per 60s (Redis).

| Event                      | Room                       | Who               | When                                                                                            |
| -------------------------- | -------------------------- | ----------------- | ----------------------------------------------------------------------------------------------- |
| `chat.conversation.opened` | `user:<id>`, `driver:<id>` | trip participants | After successful start                                                                          |
| `chat.join`                | C→S                        | participant       | Join `chat:<conversationId>` + **auto delivered/read** up to latest (WhatsApp open-chat)        |
| `chat.message.send`        | C→S                        | participant       | Persist then ack; server emits `chat.message.created`                                           |
| `chat.message.created`     | `chat:<conversationId>`    | room              | New message                                                                                     |
| `chat.message.delivered`   | S→C (optional C→S)         | room              | Auto when peer is in chat room; optional client `chat.message.delivered` ack after offline sync |
| `chat.message.read`        | S→C                        | room              | Auto only (no client mark-read API): on `chat.join` / REST open / peer in room on send          |
| `chat.typing`              | `chat:<conversationId>`    | peers             | Ephemeral typing                                                                                |
| `chat.conversation.closed` | `user:<id>`, `driver:<id>` | participants      | Trip completed/cancelled                                                                        |

REST: `GET /chat/conversations…`, `POST …/messages` (no mark-read route). Messages support `before` (history) and `after` (resync); resolve helpers `GET /trips/:id/chat`, `GET /customers/trips/:id/chat`.
Conversation payloads include `counterpart: { userId, name, avatar }` for the other participant (driver `avatarUrl`/name or passenger `User.avatar`/name).
Opening a chat (`chat.join`, `GET /chat/conversations/:id`, or trip resolve) **auto-marks read** up to the latest message. If the peer is already in the chat room when you send, server auto-emits **delivered + read** (blue tick).

FCM: [firebase-notifications.md](./firebase-notifications.md) (`CHAT_MESSAGE` per recipient not in chat room).

## Trip completed + wallet

`POST /trips/:id/complete` (from `ARRIVED_AT_DROPOFF`):

1. Trip → `COMPLETED`
2. Credits driver wallet with booking `pricing.total` (idempotent per trip)
3. Driver: inbox + FCM `WALLET_CREDITED`
4. Customer (if `booking.userId`): inbox + FCM `TRIP_COMPLETED` → prompt to rate driver (`POST /customers/trips/:id/review`)
5. Realtime wallet events on `driver:<driverId>`
6. Leaves trip room / flushes live GPS

| Event                         | Room          | When                            |
| ----------------------------- | ------------- | ------------------------------- |
| `wallet.credited`             | `driver:<id>` | Trip amount credited            |
| `driver.wallet.credited`      | `driver:<id>` | Same payload (driver-app alias) |
| `driver.notification.created` | `driver:<id>` | Inbox row for `WALLET_CREDITED` |
| `notification.created`        | `user:<id>`   | Inbox row for `TRIP_COMPLETED`  |

Wallet / notification payload:

```json
{
  "tripId": "t_123",
  "bookingId": "b_456",
  "bookingNumber": "BK-100",
  "amount": 80,
  "balance": 160,
  "transactionId": "wt_789"
}
```

Refresh balance anytime via REST `GET /drivers/wallet`.

## Trip cancelled

`POST /trips/:id/cancel` (any active status):

1. Trip + booking → `CANCELLED`
2. Inbox + FCM `TRIP_CANCELLED` for that driver
3. Leaves trip room / flushes live GPS

| Event                         | Room          | When                           |
| ----------------------------- | ------------- | ------------------------------ |
| `driver.notification.created` | `driver:<id>` | Inbox row for `TRIP_CANCELLED` |

## Driver subscriptions

Subscription domain notifications use the standard inbox path (DB → WebSocket → optional FCM). Drivers listen on `driver.notification.created` only — there is no separate `subscription.*` Socket.IO event.

Billing uses the **payment module** (one-time Stripe Checkout, purpose `DRIVER_SUBSCRIPTION`). Period close / past-due / trial reminders run via the subscription billing queue — not Stripe Billing webhooks.

| Event                         | Room          | When                              |
| ----------------------------- | ------------- | --------------------------------- |
| `driver.notification.created` | `driver:<id>` | Any subscription inbox type below |

| `type`                          | When                                                                                                        |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `SUBSCRIPTION_ACTIVATED`        | Free-first trial / zero-amount activate, first paid checkout, paid renewal, or successful off-session renew |
| `SUBSCRIPTION_TRIAL_ENDING`     | Daily billing job ≈ 3 days before `trialEnd`                                                                |
| `SUBSCRIPTION_PAYMENT_FAILED`   | Off-session renew failed (period end or grace dunning retry; includes attempt metadata)                     |
| `SUBSCRIPTION_PAST_DUE`         | Period ended without renew; grace retries may continue when a card is saved                                 |
| `SUBSCRIPTION_EXPIRED`          | Past grace on `PAST_DUE`, or cancel scheduled and period ended                                              |
| `SUBSCRIPTION_PLAN_CHANGED`     | `POST .../upgrade` (immediate or after checkout) or `POST .../downgrade` scheduled                          |
| `SUBSCRIPTION_CANCEL_SCHEDULED` | `POST .../cancel` (`cancelAtPeriodEnd=true`)                                                                |
| `SUBSCRIPTION_RESUMED`          | `POST .../resume` (clears `cancelAtPeriodEnd`)                                                              |

### Driver REST (refresh UI after events)

| Method | Path                               | Notes                                                       |
| ------ | ---------------------------------- | ----------------------------------------------------------- |
| `GET`  | `/drivers/subscriptions/plans`     | Active DRIVER plans                                         |
| `GET`  | `/drivers/subscriptions/me`        | Current non-terminal subscription                           |
| `POST` | `/drivers/subscriptions/subscribe` | Free months → trial without pay; else checkout (saves card) |
| `POST` | `/drivers/subscriptions/renew`     | Past-due renew (+ optional `planId`)                        |
| `POST` | `/drivers/subscriptions/upgrade`   | Prorated upgrade while ACTIVE/TRIALING                      |
| `POST` | `/drivers/subscriptions/downgrade` | Schedule lower plan at period end                           |
| `POST` | `/drivers/subscriptions/cancel`    | Schedule end of period                                      |
| `POST` | `/drivers/subscriptions/resume`    | Undo scheduled cancel                                       |

Payload shape (inbox):

```json
{
  "id": "n_123",
  "type": "SUBSCRIPTION_PAST_DUE",
  "title": "Subscription renewal required",
  "body": "Your billing period ended. Renew to keep access after the grace period.",
  "data": { "subscriptionId": "sub_456" },
  "createdAt": "2026-08-27T12:00:00.000Z",
  "readAt": null
}
```

FCM titles/bodies and `push` flags: [firebase-notifications.md](./firebase-notifications.md) (Driver subscriptions).

Refresh subscription UI from the REST endpoints above after these events.

## Driver payouts

Driver wallet withdrawals. Bank details are snapshotted on the payout row; admin marks paid after manual bank transfer (`PAYOUT_DEBIT` on wallet).

Platform limits (`GET/PATCH /settings`, `SUPER_ADMIN`): `payoutMin` (default `10`), `payoutIntervalDays` (default `7`). Available balance = wallet balance − sum of `PENDING`, `APPROVED`, and `PROCESSING` payouts.

### Status flow

```text
Driver request → PENDING
  ├─ driver cancel → CANCELLED
  ├─ admin reject → REJECTED
  └─ admin approve → APPROVED
        ├─ admin reject → REJECTED
        ├─ mark processing → PROCESSING
        │     └─ admin reject → REJECTED
        └─ mark paid → PAID (+ PAYOUT_DEBIT)
```

### `PayoutLifecycleEvent` (database)

Each transition appends a `PayoutEvent` row (`payoutId`, `event`, `previousStatus`, `newStatus`, optional `metadata`). **Not emitted on Socket.IO** — Postgres audit only.

| Event        | When                                      | Status change                                      |
| ------------ | ----------------------------------------- | -------------------------------------------------- |
| `CREATED`    | Payout row inserted                       | → `PENDING`                                        |
| `SUBMITTED`  | Same transaction as create                | `PENDING` → `PENDING`                              |
| `APPROVED`   | Admin approve                             | `PENDING` → `APPROVED`                             |
| `PROCESSING` | Admin mark processing                     | `APPROVED` → `PROCESSING`                          |
| `PAID`       | Admin mark paid (settle)                  | `PROCESSING` → `PAID`                              |
| `REJECTED`   | Admin reject                              | `PENDING` / `APPROVED` / `PROCESSING` → `REJECTED` |
| `CANCELLED`  | Driver cancel                             | `PENDING` → `CANCELLED`                            |
| `RECONCILED` | Reconcile repair (paid row missing debit) | `PAID` → `PAID`                                    |

`REJECTED` events may include `metadata.failureReason`.

### Audit log

`payout.requested` · `payout.approved` · `payout.paid` · `payout.rejected` · `payout.cancelled` (actor = JWT `user.sub`).

### Inbox (WebSocket)

Payout notifications use the standard inbox path (DB → WebSocket → optional FCM). Drivers listen on `driver.notification.created` only.

| Event                         | Room          | When                        |
| ----------------------------- | ------------- | --------------------------- |
| `driver.notification.created` | `driver:<id>` | Any payout inbox type below |

| `type`             | When                                | Push |
| ------------------ | ----------------------------------- | ---- |
| `PAYOUT_SUBMITTED` | `POST /drivers/payouts`             | yes  |
| `PAYOUT_APPROVED`  | `POST /admin/payouts/:id/approve`   | yes  |
| `PAYOUT_PAID`      | `POST /admin/payouts/:id/mark-paid` | yes  |
| `PAYOUT_REJECTED`  | `POST /admin/payouts/:id/reject`    | yes  |
| `PAYOUT_CANCELLED` | `POST /drivers/payouts/:id/cancel`  | no   |

FCM titles/bodies: [firebase-notifications.md](./firebase-notifications.md) (Driver payouts).

### Driver REST (refresh UI after events)

| Method | Path                          | Notes                             |
| ------ | ----------------------------- | --------------------------------- |
| `GET`  | `/drivers/payouts`            | Paginated list (scoped to driver) |
| `GET`  | `/drivers/payouts/:id`        | Single payout                     |
| `POST` | `/drivers/payouts`            | Request (`PENDING`)               |
| `POST` | `/drivers/payouts/:id/cancel` | Cancel while `PENDING`            |
| `GET`  | `/drivers/wallet`             | Balance after `PAYOUT_PAID`       |

### Admin REST

| Method | Path                            | Notes                                                 |
| ------ | ------------------------------- | ----------------------------------------------------- |
| `GET`  | `/admin/payouts`                | List all                                              |
| `GET`  | `/admin/payouts/:id`            | Detail                                                |
| `POST` | `/admin/payouts/:id/approve`    | `PENDING` → `APPROVED`                                |
| `POST` | `/admin/payouts/:id/processing` | `APPROVED` → `PROCESSING` (required before mark paid) |
| `POST` | `/admin/payouts/:id/mark-paid`  | `PROCESSING` → `PAID` + `PAYOUT_DEBIT`                |
| `POST` | `/admin/payouts/:id/reject`     | Body: `{ reason, notes? }`                            |

## Available bookings (offer marketplace)

Online drivers join `drivers:online` + `drivers:cat:<vehicleCategoryId>` on go-online / heartbeat (and on WS connect if already online). Leave on go-offline.

Marketplace available list is **`GET /offers/available`** (SEEKING_OFFERS in the driver’s category). Prefer Socket `booking.available` / FCM; REST is the poll fallback.

| Event               | Room                       | When                                                     |
| ------------------- | -------------------------- | -------------------------------------------------------- |
| `booking.available` | `drivers:cat:<categoryId>` | Seeking started — add to available list                  |
| `booking.taken`     | `drivers:cat:<categoryId>` | Paid + trip created — remove from available list         |
| `offer.request`     | `driver:<id>`              | Nearby match nudge (does not replace category available) |

**`booking.available`**

`OfferService.startSeeking` / payment reopen → `NotifyService.available`

Payload: see Offer marketplace section above (same shape as list items). Session window is `offerSessionExpiresAt` from platform `offerSessionTtlMin`.

FCM targets: online drivers in the same vehicle category (inbox + push when token / push settings allow). Location is for maps/fleet only — not used to filter who gets the notification.

**`booking.taken`**

Marketplace pay fulfillment (`OfferService.onMarketplacePaid`) → `NotifyService.taken`  
Also emits `offer.result` with `BOOKING_TAKEN` to tracked drivers on `driver:<id>`.

Payload: `{ type: "BOOKING_TAKEN", payload: { bookingId, tripId, bookingNumber } }`

## Fleet map

- WS: `driver.fleet.updated` / `driver.location` on `ops:fleet`
- REST: `GET /drivers/fleet/online` (SUPER_ADMIN)
