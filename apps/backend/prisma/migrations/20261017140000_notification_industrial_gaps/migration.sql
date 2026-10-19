-- Multi-device FCM + push category preferences + notification idempotency

CREATE TABLE IF NOT EXISTS "DriverPushDevice" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "deviceId" TEXT,
    "platform" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DriverPushDevice_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "DriverPushDevice_token_key" ON "DriverPushDevice"("token");
CREATE INDEX IF NOT EXISTS "DriverPushDevice_driverId_idx" ON "DriverPushDevice"("driverId");
CREATE UNIQUE INDEX IF NOT EXISTS "DriverPushDevice_driverId_deviceId_key" ON "DriverPushDevice"("driverId", "deviceId");

ALTER TABLE "DriverPushDevice"
  DROP CONSTRAINT IF EXISTS "DriverPushDevice_driverId_fkey";
ALTER TABLE "DriverPushDevice"
  ADD CONSTRAINT "DriverPushDevice_driverId_fkey"
  FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "CustomerPushDevice" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "deviceId" TEXT,
    "platform" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CustomerPushDevice_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CustomerPushDevice_token_key" ON "CustomerPushDevice"("token");
CREATE INDEX IF NOT EXISTS "CustomerPushDevice_customerId_idx" ON "CustomerPushDevice"("customerId");
CREATE UNIQUE INDEX IF NOT EXISTS "CustomerPushDevice_customerId_deviceId_key" ON "CustomerPushDevice"("customerId", "deviceId");

ALTER TABLE "CustomerPushDevice"
  DROP CONSTRAINT IF EXISTS "CustomerPushDevice_customerId_fkey";
ALTER TABLE "CustomerPushDevice"
  ADD CONSTRAINT "CustomerPushDevice_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "idempotencyKey" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "Notification_idempotencyKey_key" ON "Notification"("idempotencyKey");

-- Backfill legacy single tokens into device tables
INSERT INTO "DriverPushDevice" ("id", "driverId", "token", "deviceId", "platform", "createdAt", "updatedAt")
SELECT
  md5("id" || coalesce("fcmToken", '')) ,
  "id",
  "fcmToken",
  NULL,
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Driver"
WHERE "fcmToken" IS NOT NULL
  AND "fcmToken" <> ''
  AND NOT EXISTS (
    SELECT 1 FROM "DriverPushDevice" d WHERE d."token" = "Driver"."fcmToken"
  );

INSERT INTO "CustomerPushDevice" ("id", "customerId", "token", "deviceId", "platform", "createdAt", "updatedAt")
SELECT
  md5("id" || coalesce("fcmToken", '')),
  "id",
  "fcmToken",
  NULL,
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Customer"
WHERE "fcmToken" IS NOT NULL
  AND "fcmToken" <> ''
  AND NOT EXISTS (
    SELECT 1 FROM "CustomerPushDevice" d WHERE d."token" = "Customer"."fcmToken"
  );
