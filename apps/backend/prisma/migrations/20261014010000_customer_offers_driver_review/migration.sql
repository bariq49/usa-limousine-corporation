-- Drop guest offer-watch token (marketplace is logged-in customer only).
DROP INDEX IF EXISTS "Booking_offerWatchToken_key";
DROP INDEX IF EXISTS "Booking_offerWatchToken_idx";
ALTER TABLE "Booking" DROP COLUMN IF EXISTS "offerWatchToken";

-- Customer FCM for push (trip complete, etc.).
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "fcmToken" TEXT;

-- Customer rates driver after completed trip.
CREATE TABLE IF NOT EXISTS "DriverReview" (
  "id" TEXT NOT NULL,
  "tripId" TEXT NOT NULL,
  "driverId" TEXT NOT NULL,
  "bookingId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "comment" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DriverReview_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "DriverReview_tripId_key" ON "DriverReview"("tripId");
CREATE INDEX IF NOT EXISTS "DriverReview_driverId_idx" ON "DriverReview"("driverId");
CREATE INDEX IF NOT EXISTS "DriverReview_bookingId_idx" ON "DriverReview"("bookingId");
CREATE INDEX IF NOT EXISTS "DriverReview_userId_idx" ON "DriverReview"("userId");
CREATE INDEX IF NOT EXISTS "DriverReview_createdAt_idx" ON "DriverReview"("createdAt");

ALTER TABLE "DriverReview" DROP CONSTRAINT IF EXISTS "DriverReview_tripId_fkey";
ALTER TABLE "DriverReview"
  ADD CONSTRAINT "DriverReview_tripId_fkey"
  FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DriverReview" DROP CONSTRAINT IF EXISTS "DriverReview_driverId_fkey";
ALTER TABLE "DriverReview"
  ADD CONSTRAINT "DriverReview_driverId_fkey"
  FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "DriverReview" DROP CONSTRAINT IF EXISTS "DriverReview_userId_fkey";
ALTER TABLE "DriverReview"
  ADD CONSTRAINT "DriverReview_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
