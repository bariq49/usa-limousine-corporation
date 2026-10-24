-- Payment details move from Booking to their own table
ALTER TABLE "Booking" DROP COLUMN "paymentStatus",
DROP COLUMN "paymentMode",
DROP COLUMN "stripePaymentIntentId",
DROP COLUMN "paidAt";

DROP TYPE "PaymentStatus";
CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'CANCELLED');

-- Remove the CREW_RIDE booking type
UPDATE "Booking" SET "bookingType" = 'ONE_WAY' WHERE "bookingType" = 'CREW_RIDE';
CREATE TYPE "BookingType_new" AS ENUM ('ONE_WAY', 'RETURN', 'HOURLY');
ALTER TABLE "Booking" ALTER COLUMN "bookingType" DROP DEFAULT;
ALTER TABLE "Booking" ALTER COLUMN "bookingType" TYPE "BookingType_new" USING ("bookingType"::text::"BookingType_new");
ALTER TYPE "BookingType" RENAME TO "BookingType_old";
ALTER TYPE "BookingType_new" RENAME TO "BookingType";
DROP TYPE "BookingType_old";
ALTER TABLE "Booking" ALTER COLUMN "bookingType" SET DEFAULT 'ONE_WAY';

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "mode" "PaymentMode" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "transactionId" TEXT,
    "stripeSessionId" TEXT NOT NULL,
    "cardBrand" TEXT,
    "cardLast4" TEXT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_bookingId_key" ON "Payment"("bookingId");
CREATE UNIQUE INDEX "Payment_transactionId_key" ON "Payment"("transactionId");
CREATE UNIQUE INDEX "Payment_stripeSessionId_key" ON "Payment"("stripeSessionId");
CREATE INDEX "Payment_status_createdAt_idx" ON "Payment"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
