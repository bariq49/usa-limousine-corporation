-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PAID', 'FAILED');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
ADD COLUMN "paymentMode" "PaymentMode",
ADD COLUMN "stripeSessionId" TEXT,
ADD COLUMN "stripePaymentIntentId" TEXT,
ADD COLUMN "paidAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Booking_stripeSessionId_key" ON "Booking"("stripeSessionId");
