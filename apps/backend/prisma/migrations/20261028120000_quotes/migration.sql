-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "vehicleCategoryId" TEXT NOT NULL,
    "inputHash" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "pricing" JSONB NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "quoteId" TEXT,
ADD COLUMN "squarePaymentLinkUrl" TEXT;

-- CreateIndex
CREATE INDEX "Quote_expiresAt_idx" ON "Quote"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_quoteId_key" ON "Booking"("quoteId");

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_vehicleCategoryId_fkey" FOREIGN KEY ("vehicleCategoryId") REFERENCES "VehicleCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;
