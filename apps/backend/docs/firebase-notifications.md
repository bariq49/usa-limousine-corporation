# Firebase notifications (FCM)

Driver / customer push via Firebase (lock screen / background). Inbox also goes over WebSocket — see [websocket-events.md](./websocket-events.md).

Test FCM (super admin): `POST /notifications/test` body `{ "token" }` — generic ping, returns `ok` / `error`.

**Architecture:** the notification module is generic (inbox CRUD, Socket emit, FCM queue). Domain modules register:

- `TokenResolver` — multi-device FCM tokens + master `push` (driver / customer)
- `Channel` — Socket room + inbox created event (`notification.created` / `driver.notification.created`)

FCM `data` is built by generic flatten of the notify payload. Invalid tokens are cleared via `invalidateTokens` on each resolver.

**Multi-device:** `PATCH /drivers/fcm-token` and `PATCH /customers/fcm-token` accept `{ token, deviceId?, platform? }` and upsert into `DriverPushDevice` / `CustomerPushDevice` (legacy `fcmToken` dual-written for rollback).

**Idempotency:** optional `idempotencyKey` on notify — duplicate key returns the existing inbox row without re-delivery.

**Customer push gate:** `CustomerTokenResolver` allows FCM only when:

1. At least one `CustomerPushDevice` row exists — `PATCH /customers/fcm-token`
2. `CustomerSettings.push` is `true` (default) — `GET/PATCH /customers/settings`

Covers trip complete/cancel, chat, help-center tickets, etc. Inbox row + Socket `notification.created` still run when push is off; only lock-screen FCM is skipped.

**Customer inbox REST** (mirror of drivers): `GET/PATCH/DELETE /customers/notifications*` — keyed as `RecipientType.USER` + `userId`.

### Socket.IO events (related index)

Full detail: [websocket-events.md](./websocket-events.md).

`auth:session_revoked`
`driver.presence.updated`
`driver.fleet.updated`
`driver.location`
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

### Offer marketplace payload `type` (inside FCM / WS `data`)

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

## Offer marketplace (drivers)

Realtime Socket events: [websocket-events.md](./websocket-events.md) (Offer marketplace / Available bookings).

| Channel                                                  | Role                                                                                        |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Socket `booking.available` on `drivers:cat:<categoryId>` | Live update for `GET /offers/available` (create / reopen / **price counter**)               |
| FCM `BOOKING_AVAILABLE`                                  | Lock-screen nudge to submit a quote (skipped for drivers who already quoted on counter)     |
| Socket `offer.request` on `driver:<id>`                  | Nearby match / price update / relist — **WS only**, no extra FCM                            |
| Socket `offer.result` `BOOKING_QUOTED` on `driver:<id>`  | Quoting driver — remove booking from their available list                                   |
| FCM `BOOKING_UNAVAILABLE` + Socket `booking.taken`       | Remove booking from available when customer **accepts** (and again after pay / trip create) |
| FCM `OFFER_RECEIVED`                                     | Customer — driver submitted a quote                                                         |
| FCM `OFFER_ACCEPTED`                                     | Winning driver — customer accepted their quote (awaiting payment)                           |

## `BOOKING_AVAILABLE`

`OfferService.startSeeking` (customer `POST /customers/bookings`) → `NotifyService.available`  
Also: payment timeout / failed payment reopen seeking → `NotifyService.available` again.  
Also: customer `POST /customers/bookings/:id/counter` → `NotifyService.available` again (excludes drivers with a pending quote).

Targets: **online** drivers in the booking’s vehicle category (minus `excludeDriverIds`). Inbox + FCM when push enabled.

| Field   | Value                                                                                      |
| ------- | ------------------------------------------------------------------------------------------ |
| `type`  | `BOOKING_AVAILABLE`                                                                        |
| `title` | `New ride request — submit your offer` (counter: `Ride price updated — submit your offer`) |
| `body`  | `Booking {bookingNumber} is seeking offers`                                                |
| `data`  | `{ type: "BOOKING_AVAILABLE", payload }` — same fields as `GET /offers/available` items    |

## `OFFER_RECEIVED` (customer)

Driver `POST /offers` (quote) → `NotifyService.offerReceived`

| Field            | Value                                                                                                     |
| ---------------- | --------------------------------------------------------------------------------------------------------- |
| `recipient`      | `USER` (`booking.userId`)                                                                                 |
| `type`           | `OFFER_RECEIVED`                                                                                          |
| `title`          | `New driver offer`                                                                                        |
| `body`           | `A driver offered {quotedPrice} for booking {bookingNumber}`                                              |
| `data`           | `{ type: "OFFER_CREATED", payload: { offerId, bookingId, driverId, quotedPrice, etaMinutes, distance } }` |
| `idempotencyKey` | `offer-received:{offerId}`                                                                                |

Also emits Socket `offer.created` on `user:<id>`. Quoting driver gets Socket `offer.result` `BOOKING_QUOTED` (hide from their available list). `GET /offers/available` excludes bookings the driver already quoted.

## `OFFER_ACCEPTED` (driver)

Customer `POST /customers/bookings/offers/:offerId/accept` → `NotifyService.offerAccepted`

| Field            | Value                                                                                     |
| ---------------- | ----------------------------------------------------------------------------------------- |
| `recipient`      | `DRIVER` (winning driver)                                                                 |
| `type`           | `OFFER_ACCEPTED`                                                                          |
| `title`          | `Offer accepted`                                                                          |
| `body`           | `Customer accepted your offer for {bookingNumber}. Awaiting payment.`                     |
| `data`           | `{ type: "OFFER_ACCEPTED", payload: { bookingId, offerId, quotedPrice, bookingNumber } }` |
| `idempotencyKey` | `offer-accepted:{offerId}`                                                                |

Also: category Socket `booking.taken` + FCM `BOOKING_UNAVAILABLE` to other online drivers (remove from available). Winner also gets Socket `offer.result` `OFFER_ACCEPTED`.

## `CHAT_MESSAGE`

`ChatService.sendForUser` when that recipient’s user id is **not** present in `chat:<conversationId>` (per-user; other devices of an online peer still get FCM if they are not in the room).

| Field     | Value                                                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `type`    | `CHAT_MESSAGE`                                                                                                                        |
| `title`   | `New message`                                                                                                                         |
| `body`    | Message preview (trimmed)                                                                                                             |
| `data`    | Flat + nested: `conversationId`, `messageId`, `subjectType`, `subjectId`, `tripId` (when trip), and `payload: { … }`                  |
| Recipient | **Driver app:** `DRIVER` + `Driver.id` → `Driver.fcmToken`. **Customer app:** `USER` + `User.id` → `Customer.fcmToken` (via `userId`) |

When: recipient’s `User.id` is **not** in Socket.IO room `chat:<conversationId>` (typically fully offline / no WS). If they are connected they already got `chat.message.created`. See [websocket-events.md](./websocket-events.md) (Ride chat).

## `BOOKING_UNAVAILABLE`

1. Customer accepts an offer → `NotifyService.offerAccepted` → `taken` (tripId `null`, title “Booking reserved”)
2. Marketplace pay fulfillment (`OfferService.onMarketplacePaid`) → `NotifyService.taken` (with `tripId`)

Same targeting as available, excluding the winning driver.

| Field   | Value                                                                      |
| ------- | -------------------------------------------------------------------------- |
| `type`  | `BOOKING_UNAVAILABLE`                                                      |
| `title` | `Booking reserved` / `Booking taken`                                       |
| `body`  | Accepted / taken copy for `{bookingNumber}`                                |
| `data`  | `{ type: "BOOKING_TAKEN", payload: { bookingId, tripId, bookingNumber } }` |

## `WALLET_CREDITED` (driver)

`POST /trips/:id/complete` → credits wallet → driver inbox/FCM

| Field   | Value                                                                                     |
| ------- | ----------------------------------------------------------------------------------------- |
| `type`  | `WALLET_CREDITED`                                                                         |
| `title` | `Wallet credited`                                                                         |
| `body`  | `Booking {bookingNumber} completed. {amount} added to your wallet.`                       |
| `data`  | `{ type, payload: { tripId, bookingId, bookingNumber, amount, balance, transactionId } }` |

Also emits realtime Socket.IO `wallet.credited` / `driver.wallet.credited` — see [websocket-events.md](./websocket-events.md).

## `TRIP_COMPLETED` (customer)

Same complete call → customer inbox + FCM when `Customer.fcmToken` is set and push settings allow it.

| Field       | Value                                                               |
| ----------- | ------------------------------------------------------------------- |
| `recipient` | `USER` (`booking.userId`)                                           |
| `type`      | `TRIP_COMPLETED`                                                    |
| `title`     | `Trip completed`                                                    |
| `body`      | `Your trip {bookingNumber} is complete. Please rate your driver.`   |
| `data`      | `{ type, payload: { tripId, bookingId, bookingNumber, driverId } }` |

Customer rates driver: `POST /customers/trips/:id/review` `{ rating, comment? }` → updates `Driver.ratingAvg` / `ratingCount`.  
Driver rates passenger (existing): `POST /trips/:id/review`.

## `TRIP_CANCELLED`

`POST /trips/:id/cancel` → notifies cancelling driver

| Field   | Value                                                                         |
| ------- | ----------------------------------------------------------------------------- |
| `type`  | `TRIP_CANCELLED`                                                              |
| `title` | `Trip cancelled`                                                              |
| `body`  | `Trip {bookingNumber} was cancelled.`                                         |
| `data`  | `{ type, payload: { tripId, bookingId, bookingNumber, cancellationReason } }` |

## Help center

Drivers create/list/view tickets only. Only admin can reply or change status.

### `TICKET_STATUS_UPDATED` (inbox only, no FCM)

`PATCH /admin/tickets/:id/status` when status is **not** `RESOLVED`

| Field   | Value                                   |
| ------- | --------------------------------------- |
| `type`  | `TICKET_STATUS_UPDATED`                 |
| `title` | `Help ticket updated`                   |
| `body`  | `Ticket {ticketNumber} is now {status}` |
| `push`  | `false` (WebSocket inbox only)          |

### `TICKET_REPLY` (FCM)

`POST /admin/tickets/:id/messages` (admin)

| Field   | Value                                      |
| ------- | ------------------------------------------ |
| `type`  | `TICKET_REPLY`                             |
| `title` | `Help ticket reply`                        |
| `body`  | `Support replied to ticket {ticketNumber}` |
| `push`  | `true`                                     |

### `TICKET_RESOLVED` (FCM)

`PATCH /admin/tickets/:id/status` → `RESOLVED`

| Field   | Value                                     |
| ------- | ----------------------------------------- |
| `type`  | `TICKET_RESOLVED`                         |
| `title` | `Help ticket resolved`                    |
| `body`  | `Ticket {ticketNumber} has been resolved` |
| `push`  | `true`                                    |

## Driver application

Inbox + FCM when the driver has a token and push enabled. Email is still sent separately.

### `APPLICATION_UNDER_REVIEW` (FCM)

`POST /drivers/:id/under-review` (admin)

| Field   | Value                                              |
| ------- | -------------------------------------------------- |
| `type`  | `APPLICATION_UNDER_REVIEW`                         |
| `title` | `Application under review`                         |
| `body`  | `Application {applicationNumber} is under review.` |
| `push`  | `true`                                             |

### `APPLICATION_APPROVED` (FCM)

`POST /drivers/:id/approve` (admin)

| Field   | Value                                                                               |
| ------- | ----------------------------------------------------------------------------------- |
| `type`  | `APPLICATION_APPROVED`                                                              |
| `title` | `Application approved`                                                              |
| `body`  | `Application {applicationNumber} was approved. Check your email for login details.` |
| `push`  | `true`                                                                              |

## Driver subscriptions

All of these create a driver inbox row and emit `driver.notification.created` (see [websocket-events.md](./websocket-events.md)). `push: true` → FCM when the driver has a token and push enabled.

Shared `data`: `{ subscriptionId }`.

Audience → recipient is mapped via `recipientFor` (`DRIVER` → driver inbox, `USER` → customer inbox). Other target roles extend that helper.

### `SUBSCRIPTION_ACTIVATED` (FCM)

Free-first trial / zero-amount local activate, first paid checkout, manual renew checkout, or successful off-session renew.

| Field   | Value                                                                  |
| ------- | ---------------------------------------------------------------------- |
| `type`  | `SUBSCRIPTION_ACTIVATED`                                               |
| `title` | `Subscription activated` / `Subscription renewed`                      |
| `body`  | `Your subscription is active.` / `Your subscription has been renewed.` |
| `push`  | `true`                                                                 |

### `SUBSCRIPTION_TRIAL_ENDING` (FCM)

Daily billing job ≈ 3 days before `trialEnd`.

| Field   | Value                                 |
| ------- | ------------------------------------- |
| `type`  | `SUBSCRIPTION_TRIAL_ENDING`           |
| `title` | `Trial ending soon`                   |
| `body`  | `Your free trial ends in a few days.` |
| `push`  | `true`                                |

### `SUBSCRIPTION_PAYMENT_FAILED` (FCM)

Off-session renew failed at period end or during grace dunning retries (up to 3 attempts, ~daily).

| Field   | Value                                                                              |
| ------- | ---------------------------------------------------------------------------------- |
| `type`  | `SUBSCRIPTION_PAYMENT_FAILED`                                                      |
| `title` | `Payment failed` / `Final renewal attempt failed`                                  |
| `body`  | Attempt copy with `attempt` / `maxAttempts`, or final “update payment method” copy |
| `data`  | `{ subscriptionId, attempt, maxAttempts, final }`                                  |
| `push`  | `true`                                                                             |

### `SUBSCRIPTION_PAST_DUE` (FCM)

Period ended without a successful renew (no saved card, or first off-session charge failed). Grace retries may still run.

| Field   | Value                                                                                                         |
| ------- | ------------------------------------------------------------------------------------------------------------- |
| `type`  | `SUBSCRIPTION_PAST_DUE`                                                                                       |
| `title` | `Subscription renewal required`                                                                               |
| `body`  | `Your billing period ended. We will retry payment during the grace period, or renew manually to keep access.` |
| `push`  | `true`                                                                                                        |

### `SUBSCRIPTION_EXPIRED` (FCM)

Billing job after grace on `PAST_DUE`, or period end after scheduled cancel.

| Field   | Value                                                                                             |
| ------- | ------------------------------------------------------------------------------------------------- |
| `type`  | `SUBSCRIPTION_EXPIRED`                                                                            |
| `title` | `Subscription expired` / `Subscription ended`                                                     |
| `body`  | `Your subscription expired after the grace period.` / `Your subscription has ended as scheduled.` |
| `push`  | `true`                                                                                            |

### `SUBSCRIPTION_PLAN_CHANGED` (FCM)

`POST /drivers/subscriptions/upgrade` (now or after checkout) or `POST /drivers/subscriptions/downgrade` (scheduled).

| Field   | Value                                                                                                    |
| ------- | -------------------------------------------------------------------------------------------------------- |
| `type`  | `SUBSCRIPTION_PLAN_CHANGED`                                                                              |
| `title` | `Plan upgraded` / `Plan change scheduled`                                                                |
| `body`  | `Your plan is now {planName}.` / `Your plan will change to {planName} at the end of the current period.` |
| `push`  | `true`                                                                                                   |

### `SUBSCRIPTION_CANCEL_SCHEDULED` (FCM)

`POST /drivers/subscriptions/cancel` (`cancelAtPeriodEnd=true`).

| Field   | Value                                                            |
| ------- | ---------------------------------------------------------------- |
| `type`  | `SUBSCRIPTION_CANCEL_SCHEDULED`                                  |
| `title` | `Subscription cancellation scheduled`                            |
| `body`  | `Your subscription will end at the close of the current period.` |
| `push`  | `true`                                                           |

### `SUBSCRIPTION_RESUMED` (FCM)

`POST /drivers/subscriptions/resume`.

| Field   | Value                                         |
| ------- | --------------------------------------------- |
| `type`  | `SUBSCRIPTION_RESUMED`                        |
| `title` | `Subscription resumed`                        |
| `body`  | `Your subscription will renew automatically.` |
| `push`  | `true`                                        |

## Driver payouts

All of these create a driver inbox row and emit `driver.notification.created` (see [websocket-events.md](./websocket-events.md)). `PayoutLifecycleEvent` rows are Postgres-only — not FCM.

Shared `data` fields: `{ type, payoutId, payoutNumber, amount, recipientType, recipientId }` (plus `reason` on reject).

### `PAYOUT_SUBMITTED` (FCM)

`POST /drivers/payouts` → writes `PayoutEvent`: `CREATED`, `SUBMITTED`.

| Field   | Value                                                   |
| ------- | ------------------------------------------------------- |
| `type`  | `PAYOUT_SUBMITTED`                                      |
| `title` | `Payout requested`                                      |
| `body`  | `Payout {payoutNumber} for {amount} is pending review.` |
| `push`  | `true`                                                  |

### `PAYOUT_APPROVED` (FCM)

`POST /admin/payouts/:id/approve` → `PayoutEvent`: `APPROVED`.

| Field   | Value                                                       |
| ------- | ----------------------------------------------------------- |
| `type`  | `PAYOUT_APPROVED`                                           |
| `title` | `Payout approved`                                           |
| `body`  | `Payout {payoutNumber} was approved and will be processed.` |
| `push`  | `true`                                                      |

### `PAYOUT_PAID` (FCM)

`POST /admin/payouts/:id/mark-paid` → `PayoutEvent`: `PAID` + wallet `PAYOUT_DEBIT`.

| Field   | Value                                               |
| ------- | --------------------------------------------------- |
| `type`  | `PAYOUT_PAID`                                       |
| `title` | `Payout completed`                                  |
| `body`  | `Payout {payoutNumber} for {amount} has been paid.` |
| `push`  | `true`                                              |

### `PAYOUT_REJECTED` (FCM)

`POST /admin/payouts/:id/reject` → `PayoutEvent`: `REJECTED`.

| Field   | Value                                 |
| ------- | ------------------------------------- |
| `type`  | `PAYOUT_REJECTED`                     |
| `title` | `Payout rejected`                     |
| `body`  | `Payout {payoutNumber} was rejected.` |
| `data`  | includes `reason`                     |
| `push`  | `true`                                |

### `PAYOUT_CANCELLED` (inbox only, no FCM)

`POST /drivers/payouts/:id/cancel` → `PayoutEvent`: `CANCELLED`.

| Field   | Value                                  |
| ------- | -------------------------------------- |
| `type`  | `PAYOUT_CANCELLED`                     |
| `title` | `Payout cancelled`                     |
| `body`  | `Payout {payoutNumber} was cancelled.` |
| `push`  | `false` (WebSocket inbox only)         |
