-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'SEEKING_OFFERS';
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'AWAITING_PAYMENT';

-- CreateEnum
CREATE TYPE "BookingOfferStatus" AS ENUM (
  'PENDING',
  'ACCEPTED',
  'DECLINED_BY_CUSTOMER',
  'WITHDRAWN',
  'SUPERSEDED',
  'EXPIRED'
);

-- AlterTable
ALTER TABLE "Booking"
  ADD COLUMN IF NOT EXISTS "offerSessionExpiresAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "matchingRadius" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "acceptedOfferId" TEXT,
  ADD COLUMN IF NOT EXISTS "offerWatchToken" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "BookingOffer" (
  "id" TEXT NOT NULL,
  "bookingId" TEXT NOT NULL,
  "driverId" TEXT NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "quotedPrice" DECIMAL(14,4) NOT NULL,
  "etaMinutes" INTEGER,
  "distance" DOUBLE PRECISION,
  "fairPriceDelta" DECIMAL(14,4),
  "status" "BookingOfferStatus" NOT NULL DEFAULT 'PENDING',
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),

  CONSTRAINT "BookingOffer_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "Booking_acceptedOfferId_key" ON "Booking"("acceptedOfferId");
CREATE UNIQUE INDEX IF NOT EXISTS "Booking_offerWatchToken_key" ON "Booking"("offerWatchToken");
CREATE INDEX IF NOT EXISTS "Booking_status_offerSessionExpiresAt_idx" ON "Booking"("status", "offerSessionExpiresAt");
CREATE INDEX IF NOT EXISTS "Booking_offerWatchToken_idx" ON "Booking"("offerWatchToken");

CREATE INDEX IF NOT EXISTS "BookingOffer_bookingId_status_idx" ON "BookingOffer"("bookingId", "status");
CREATE INDEX IF NOT EXISTS "BookingOffer_driverId_status_idx" ON "BookingOffer"("driverId", "status");
CREATE INDEX IF NOT EXISTS "BookingOffer_expiresAt_idx" ON "BookingOffer"("expiresAt");
CREATE INDEX IF NOT EXISTS "BookingOffer_deletedAt_idx" ON "BookingOffer"("deletedAt");
CREATE UNIQUE INDEX IF NOT EXISTS "BookingOffer_bookingId_driverId_pending_key"
  ON "BookingOffer"("bookingId", "driverId")
  WHERE "status" = 'PENDING' AND "deletedAt" IS NULL;

-- ForeignKeys
ALTER TABLE "BookingOffer" DROP CONSTRAINT IF EXISTS "BookingOffer_bookingId_fkey";
ALTER TABLE "BookingOffer"
  ADD CONSTRAINT "BookingOffer_bookingId_fkey"
  FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BookingOffer" DROP CONSTRAINT IF EXISTS "BookingOffer_driverId_fkey";
ALTER TABLE "BookingOffer"
  ADD CONSTRAINT "BookingOffer_driverId_fkey"
  FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "BookingOffer" DROP CONSTRAINT IF EXISTS "BookingOffer_vehicleId_fkey";
ALTER TABLE "BookingOffer"
  ADD CONSTRAINT "BookingOffer_vehicleId_fkey"
  FOREIGN KEY ("vehicleId") REFERENCES "DriverVehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Booking" DROP CONSTRAINT IF EXISTS "Booking_acceptedOfferId_fkey";
ALTER TABLE "Booking"
  ADD CONSTRAINT "Booking_acceptedOfferId_fkey"
  FOREIGN KEY ("acceptedOfferId") REFERENCES "BookingOffer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
