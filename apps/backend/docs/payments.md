# Payments

## Services

| Service                | Responsibility                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------ |
| `PaymentService`       | Admin list + get + public status                                                                 |
| `CheckoutService`      | Stripe checkout session (`setup_future_usage` when `savePaymentMethod`)                          |
| `ChargeService`        | Off-session charge with saved customer + payment method (subscription auto-renew)                |
| `PaymentMethodService` | List / detach cards; Checkout `mode=setup` to add a card; emits `payment_method.setup_completed` |
| `WebhookService`       | Stripe webhooks + transactional outbox write                                                     |
| `RefundService`        | Refund state from `charge.refunded`                                                              |
| `EventsQueueService`   | Drain outbox → emit domain events                                                                |
| `ValidatorRegistry`    | Domain amount/reference validators                                                               |

## Utils

| Util                  | Responsibility                          |
| --------------------- | --------------------------------------- |
| `checkout-validation` | Purpose enum + blocked payment statuses |
| `payment-update`      | Shared payment update mapping           |

## Endpoints

| Route                            | Access                                 |
| -------------------------------- | -------------------------------------- |
| `POST /payments/checkout`        | Public (throttled)                     |
| `GET /payments/:id/status`       | Public (throttled) — success-page poll |
| `POST /payments/webhooks/stripe` | Stripe signature                       |
| `GET /payments`                  | `SUPER_ADMIN`                          |
| `GET /payments/:id`              | `SUPER_ADMIN`                          |

## Flow

1. Domain calls `POST /payments/checkout` (or booking public create) with `purpose`, `referenceId`, `amount`
2. Registered `PurposeValidator` checks reference + amount
3. `prepareForCheckout` upserts payment in a transaction
4. Stripe Checkout Session → audit log → client pays (subscription checkout sets `savePaymentMethod` so Stripe creates/attaches a reusable PM)
5. Webhook dedupes by `PaymentWebhookEvent`, updates payment + inserts `PaymentOutboxEvent` in one TX
6. Queue dispatches outbox → `payment.succeeded` / `payment.failed` → domain listeners (booking confirm/revert; driver subscription `onPaid` + attach PM)
7. Success page can poll `GET /payments/:id/status`
8. Subscription billing job may call `ChargeService.tryOffSession` at period end when a PM is saved; success writes payment + outbox the same way
9. Drivers manage cards via `/drivers/payment-methods` (list / add setup checkout / confirm / set default / delete). Setup Checkout webhooks emit `payment_method.setup_completed`

## Booking integration

- `POST /public/bookings` creates a `PENDING` booking, then a Stripe checkout session
- Response includes `checkoutUrl`, `sessionId`, and `paymentId`
- `CheckoutValidator` enforces booking exists, payable status, and amount match
- On success webhook → outbox → booking becomes `CONFIRMED`
- On failure/expiry webhook → outbox → booking reverts to `DRAFT`

## Reliability

- Checkout blocked when payment is `SUCCEEDED`, `REFUNDED`, or `PARTIALLY_REFUNDED`
- New payment rows rolled back if Stripe session creation fails
- Public booking deleted if checkout session creation fails
- Stripe webhook events deduplicated via `PaymentWebhookEvent`
- Domain events survive crashes via `PaymentOutboxEvent` + BullMQ drain
- Published outbox rows older than 7 days are deleted on each drain
- `DRIVER_SUBSCRIPTION` / `CUSTOMER_SUBSCRIPTION` validated by `SubscriptionCheckoutRegistrar` (subscription exists, `INCOMPLETE` / pending upgrade / `PAST_DUE`, amount matches plan or pending charge)
- Subscription checkout `referenceId` is the `Subscription.id`
- Checkout Stripe idempotency key is stable: `checkout:{paymentId}:{amountCents}`
- `onPaid` uses status / `pendingPlanId` claims (`updateMany`) so local renew + webhook races are safe
- Daily `subscription.reconcile` repairs missed `onPaid` and logs stale PENDING / past-grace PAST_DUE
- Refunds handled via `charge.refunded`
- CI runs unit + e2e (`test` / `test:e2e`) with Postgres + Redis
