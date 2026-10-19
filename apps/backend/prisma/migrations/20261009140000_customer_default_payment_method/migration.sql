-- AlterTable
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "stripePaymentMethodId" TEXT;
