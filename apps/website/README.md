# USA Limousine — public website

Marketing site and quote flow for usalimocorp.com (Next.js 16, port 3003).

```bash
pnpm --filter @usa-limousine-corporation/website dev
```

## Environment

| Variable | Example | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | `https://api.usalimocorp.com/api/v1` | Backend API (public catalog endpoints) |
| `NEXT_PUBLIC_APP_URL` | `https://www.usalimocorp.com` | Canonical site URL for SEO, robots and sitemap |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | | Places autocomplete and route distance |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | | Optional Search Console token |
| `NEXT_PUBLIC_GTM_ID` | `GTM-XXXXXXX` | Optional Google Tag Manager container |
| `NEXT_PUBLIC_GA_ID` | `G-XXXXXXXXXX` | Optional Google Analytics measurement ID |

## Booking flow

1. Trip details → route distance (miles) from Google Distance Matrix.
2. Vehicles and prices from `GET /public/vehicle-categories/pricing?distance=&isAirport=` (with the
   fee breakdown); luggage from `GET /public/luggage`; child seats from `GET /public/extra-services`;
   stop, meet & greet fees and booking notice from `GET /public/settings`.
   Hourly hire is offered as a quote request.
3. Passenger details → `POST /public/bookings/checkout` saves the booking as `PENDING` (priced on
   the server) and returns a Square payment link. No sign-in is needed.
4. The rider pays on Square and is sent back to `/book-ride/payment-success`, which shows the full
   booking from `GET /public/bookings/checkout/:orderId`. The booking is confirmed as soon as Square
   reports the payment (webhook or this page, whichever is first). Going back from Square lands on
   `/book-ride/payment-cancel`, which can resume payment or edit the booking; unpaid bookings are
   cancelled after 30 minutes.

Blog, reviews, contact and newsletter have no backend yet. They show static content, and the
forms open the visitor's email app.
