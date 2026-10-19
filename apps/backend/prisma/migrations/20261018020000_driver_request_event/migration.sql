-- CreateEnum
CREATE TYPE "DriverRequestOutcome" AS ENUM (
  'PENDING',
  'FINISHED',
  'NOT_ACCEPTED',
  'DRIVER_CANCELLED',
  'CLIENT_CANCELLED',
  'CLIENT_NO_SHOW'
);

-- CreateTable
CREATE TABLE "DriverRequestEvent" (
  "id" TEXT NOT NULL,
  "driverId" TEXT NOT NULL,
  "bookingId" TEXT NOT NULL,
  "tripId" TEXT,
  "outcome" "DriverRequestOutcome" NOT NULL DEFAULT 'PENDING',
  "outcomeAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "DriverRequestEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DriverRequestEvent_driverId_bookingId_key" ON "DriverRequestEvent"("driverId", "bookingId");

-- CreateIndex
CREATE INDEX "DriverRequestEvent_driverId_createdAt_idx" ON "DriverRequestEvent"("driverId", "createdAt");

-- CreateIndex
CREATE INDEX "DriverRequestEvent_driverId_outcome_outcomeAt_idx" ON "DriverRequestEvent"("driverId", "outcome", "outcomeAt");

-- CreateIndex
CREATE INDEX "DriverRequestEvent_bookingId_idx" ON "DriverRequestEvent"("bookingId");

-- CreateIndex
CREATE INDEX "DriverRequestEvent_tripId_idx" ON "DriverRequestEvent"("tripId");

-- CreateIndex
CREATE INDEX "DriverRequestEvent_outcome_idx" ON "DriverRequestEvent"("outcome");

-- AddForeignKey
ALTER TABLE "DriverRequestEvent" ADD CONSTRAINT "DriverRequestEvent_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverRequestEvent" ADD CONSTRAINT "DriverRequestEvent_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverRequestEvent" ADD CONSTRAINT "DriverRequestEvent_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE SET NULL ON UPDATE CASCADE;
