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
| `NEXT_PUBLIC_CUSTOMER_PORTAL_URL` | `https://customer.usalimocorp.com` | Where riders sign in and confirm bookings |
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
3. Passenger details → the draft is sent to `${NEXT_PUBLIC_CUSTOMER_PORTAL_URL}/book`, where the
   rider signs in or signs up and confirms. The portal creates a `PENDING` booking with
   `POST /customers/bookings`.

Blog, reviews, contact and newsletter have no backend yet. They show static content, and the
forms open the visitor's email app.
