# Payments

Guest checkout from the public website, paid on a Square-hosted payment link.

## Flow

1. `POST /public/bookings/checkout` validates the booking, prices it on the server, saves it as
   `PENDING` and creates a Square payment link for that total. The booking keeps the Square order
   id, payment link id and payment mode (`TEST` = sandbox, `LIVE` = production).
2. The rider pays on Square. Square redirects to `${WEBSITE_URL}/book-ride/payment-success`.
3. The booking is settled by whichever comes first:
   - the `payment.created` / `payment.updated` webhook on `POST /payments/square/webhook`
     (signature checked against `SQUARE_WEBHOOK_URL` and the mode's signature key), or
   - `GET /public/bookings/checkout/:orderId`, which the success page calls.

   Settling reads the order and payment from Square. A completed payment writes a `Payment` row and
   confirms the booking in one transaction; repeats are ignored.
4. Paid bookings notify admins in the app, email the rider (CC included) and `DEFAULT_ADMIN_EMAIL`,
   and text the rider.
5. Every 5 minutes, unpaid checkouts older than 30 minutes are settled once more; anything still
   unpaid is cancelled (`Payment` status `CANCELLED`) and its payment link deleted.

## Payment record

| Field             | Meaning                                         |
| ----------------- | ----------------------------------------------- |
| `transactionId`   | Our id, `TID-` + 12 digits (paid payments only) |
| `squareOrderId`   | Square order behind the payment link            |
| `squarePaymentId` | Square payment id                               |
| `status`          | `PAID` or `CANCELLED`                           |
| `mode`            | `TEST` or `LIVE`                                |
| `amount`          | Amount charged, in `currency`                   |
| `cardBrand`       | e.g. `VISA`                                     |
| `cardLast4`       | Last four card digits                           |
| `customer*`       | Name, email and phone at the time of payment    |
| `paidAt`          | When the payment completed                      |

Booking status: `PENDING` while checkout is open → `CONFIRMED` when paid → `COMPLETED`, or
`CANCELLED` when the checkout expires unpaid.

## Code

| Path                                   | Responsibility                                        |
| -------------------------------------- | ----------------------------------------------------- |
| `src/infrastructure/square`            | Square client: payment links, orders, webhook check   |
| `src/modules/payment/services`         | Checkout, settling, expiry sweep, paid notifications  |
| `src/modules/payment/repositories`     | Writes `Payment` and the booking status together      |
| `src/modules/payment/controllers`      | Public checkout endpoints and the Square webhook      |

Setup steps: [README → Payments (Square)](../README.md#payments-square).
