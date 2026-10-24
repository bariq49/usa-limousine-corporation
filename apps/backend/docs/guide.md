# Infrastructure credentials guide

How to get API keys / env vars for optional and required services used by `@usa-limousine-corporation/backend`.

Put values in `apps/backend/.env` (local) or `apps/backend/.env.production` on the VPS.  
Never commit real secrets. Check status with `GET /api/v1/health`.

| Service            | Health key           | Required to boot?                      |
| ------------------ | -------------------- | -------------------------------------- |
| Twilio (SMS)       | `twilio`             | No — `not_configured` until set        |
| Firebase (FCM)     | `firebase`           | No — `not_configured` until set        |
| Square (payments)  | —                    | No — checkout needs the active mode's keys |
| Cloudinary         | `storage`            | Yes                                    |
| Email (SMTP)       | `email`              | Yes                                    |
| Redis / Postgres   | `redis` / `database` | Yes                                    |

---

## Twilio (SMS)

Env vars:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_SENDER_ID=USALimoCorp
```

### 1. Create / open a Twilio account

1. Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio) and sign up (or log in).
2. Verify your email / phone if prompted.
3. Open the [Twilio Console](https://console.twilio.com/).

### 2. Get `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`

1. In the Console home (Account Dashboard), find **Account Info**.
2. Copy **Account SID** → `TWILIO_ACCOUNT_SID` (starts with `AC…`).
3. Copy **Auth Token** → `TWILIO_AUTH_TOKEN` (click to reveal).

Trial accounts work for development. For production, upgrade the account when ready.

### 3. Set `TWILIO_SENDER_ID`

Texts are sent from the company name rather than a phone number (an alphanumeric sender ID).

- Up to **11** letters, digits or spaces, with at least one letter: `USALimoCorp`.
- Some countries need the sender ID registered first: Console → **Messaging** → **Sender IDs**.
- **US and Canada (+1) numbers do not accept alphanumeric sender IDs**, so texts to them are
  not delivered. Those need a Twilio phone number instead.

### 4. Trial account limits

On a Twilio trial:

- You can only SMS **verified** destination numbers.
- Console → **Phone Numbers** → **Manage** → **Verified Caller IDs** → add your mobile.
- Outbound SMS body may include a Twilio trial prefix.

### 5. Wire into the app

1. Add the three vars to `.env`.
2. Restart the API (`pnpm --filter @usa-limousine-corporation/backend dev`).
3. Hit `GET /api/v1/health` → `"twilio": "up"`.

If keys are wrong: `"twilio": "down"`. If missing: `"twilio": "not_configured"`.

### 6. Usage in code

```ts
await this.twilio.send({
  to: "+31612345678",
  body: "Your USA Limousine Corporation verification code is 123456",
});
```

### 7. Auth OTP over SMS (optional channel)

Auth OTP defaults to **email**. Frontend can opt into SMS with `channel: "sms"`.

| Endpoint                     | Body                                                                    |
| ---------------------------- | ----------------------------------------------------------------------- |
| `POST /auth/register`        | `{ email, password, phone, channel: "sms" }` — `phone` required for SMS |
| `POST /auth/resend-otp`      | `{ email, channel: "sms" }` — uses saved `user.phone`                   |
| `POST /auth/forgot-password` | `{ email, channel: "sms" }` — uses saved `user.phone`                   |

Omit `channel` (or send `"email"`) for the existing email behavior.  
Verify still uses `POST /auth/verify-email` with the same OTP (`token`).

Driver: `POST /drivers/resend-otp` also accepts optional `channel`.

---

## Agora (RTC voice / video tokens)

Backend mints short-lived RTC tokens; clients join Agora channels with the mobile SDK. Media never goes through Nest.

Env vars:

```env
AGORA_APP_ID=your-agora-app-id
AGORA_APP_CERTIFICATE=your-agora-app-certificate
AGORA_TOKEN_TTL_SECONDS=3600
```

`AGORA_TOKEN_TTL_SECONDS` is optional (default `3600`, min `60`, max `86400`).

### 1. Create an Agora project

1. Open [Agora Console](https://console.agora.io/).
2. Sign up / log in → **Project Management** → **Create**.
3. Open the project → copy **App ID** → `AGORA_APP_ID`.

### 2. Enable and copy App Certificate

1. In the project, open **Config** (or primary certificate settings).
2. Enable **App Certificate** if prompted.
3. Copy the **Primary Certificate** → `AGORA_APP_CERTIFICATE`.

Never commit the certificate. Without both env vars, `GET /api/v1/health` reports `agora: not_configured`.

### 3. Client usage (later domain APIs)

Domain endpoints will call `AgoraService.buildRtcToken({ channel, uid })` and return `{ appId, channel, uid, token, expiresAt, role }` for the apps to `joinChannel`.

---

## Firebase (FCM push)

Env vars:

```env
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

More product detail: [firebase-notifications.md](./firebase-notifications.md).

### 1. Create a Firebase project

1. Open [Firebase Console](https://console.firebase.google.com/).
2. **Add project** (or select an existing one).
3. Note the **Project ID** → `FIREBASE_PROJECT_ID`.

### 2. Create a service account

1. Project settings (gear) → **Service accounts**.
2. Select **Firebase Admin SDK**.
3. Click **Generate new private key** → download the JSON file.

### 3. Map JSON → env

From the downloaded JSON:

| JSON field     | Env var                 |
| -------------- | ----------------------- |
| `project_id`   | `FIREBASE_PROJECT_ID`   |
| `client_email` | `FIREBASE_CLIENT_EMAIL` |
| `private_key`  | `FIREBASE_PRIVATE_KEY`  |

For `.env`, keep the key on one line with escaped newlines:

```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
```

### 4. Enable Cloud Messaging

1. Firebase Console → **Build** → **Cloud Messaging** (ensure the project can send FCM).
2. Mobile apps still need their own Firebase app config (Android/iOS); the backend only needs the Admin SDK keys above.

### 5. Verify

Restart API → `GET /api/v1/health` → `"firebase": "up"`.

---

## Square (payments)

Env vars (sandbox first):

```env
SQUARE_ACCESS_TOKEN_TEST=EAAA...
SQUARE_LOCATION_ID_TEST=L...
SQUARE_WEBHOOK_SIGNATURE_KEY_TEST=...
SQUARE_ACCESS_TOKEN_LIVE=EAAA...
SQUARE_LOCATION_ID_LIVE=L...
SQUARE_WEBHOOK_SIGNATURE_KEY_LIVE=...
SQUARE_WEBHOOK_URL=https://api.usalimocorp.com/api/v1/payments/square/webhook
```

More detail: [payments.md](./payments.md).

### Get keys

1. Open the [Square Developer Console](https://developer.squareup.com/apps) and create (or open) an
   application.
2. Switch to **Sandbox** → **Credentials** → copy the **Sandbox access token** →
   `SQUARE_ACCESS_TOKEN_TEST`.
3. **Locations** → copy the sandbox location id → `SQUARE_LOCATION_ID_TEST`.
4. **Webhooks** → **Subscriptions** → **Add subscription** with the URL
   `https://<public-api>/api/v1/payments/square/webhook` and the events `payment.created` and
   `payment.updated`. Copy its **Signature key** → `SQUARE_WEBHOOK_SIGNATURE_KEY_TEST`, and put the
   exact same URL in `SQUARE_WEBHOOK_URL`.

Locally, expose the API with a tunnel (for example `ngrok http 3000`) and use the tunnel URL.
Repeat in **Production** for the `SQUARE_*_LIVE` values when going live.

---

## Cloudinary (uploads / storage)

Env vars (required):

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

1. Sign up / log in at [https://cloudinary.com/console](https://cloudinary.com/console).
2. Dashboard → **Account Details** (or **Settings** → **API Keys**).
3. Copy **Cloud name**, **API Key**, **API Secret**.

Health: `"storage": "up"`.

---

## Email (SMTP)

Env vars (required):

```env
EMAIL_HOST=smtp.example.com
EMAIL_PORT=465
EMAIL_USER=noreply@example.com
EMAIL_PASS=replace-me
EMAIL_FROM=noreply@example.com
EMAIL_SECURE=true
```

Examples:

- **Gmail / Google Workspace** — use an [App Password](https://myaccount.google.com/apppasswords); host `smtp.gmail.com`, port `465` or `587`.
- **Mailgun / SendGrid / SES SMTP** — use the provider’s SMTP host, user, and password from their dashboard.

`EMAIL_FROM` should be an allowed sender for that provider.

---

## Redis & Postgres (required)

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/usa_limousine_corporation?schema=public
REDIS_URL=redis://localhost:6379
```

Local Docker (typical):

```bash
# Postgres + Redis containers already used by this repo
# Point DATABASE_URL / REDIS_URL at them
```

---

## After updating env

1. Restart backend (and worker if you run one).
2. Check `GET /api/v1/health`.
3. On VPS: edit `/opt/usa-limousine-corporation/apps/backend/.env.production`, then:

```bash
cd /opt/usa-limousine-corporation && DEPLOY_SERVICES=backend bash deploy/vps/update.sh
```

Deploy notes: [deploy/README.md](../../../deploy/README.md).
