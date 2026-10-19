-- AlterTable
ALTER TABLE "Customer" ADD COLUMN "stripeCustomerId" TEXT,
ADD COLUMN "stripePaymentMethodId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_stripeCustomerId_key" ON "Customer"("stripeCustomerId");
