-- AlterTable
ALTER TABLE "Refund" ADD COLUMN     "refundNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Refund_refundNumber_key" ON "Refund"("refundNumber");

