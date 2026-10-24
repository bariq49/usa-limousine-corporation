-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "stripePaymentIntentId" TEXT;

-- Existing payments keep the Stripe id and get a TID- transaction id
UPDATE "Payment"
SET "stripePaymentIntentId" = "transactionId",
    "transactionId" = 'TID-' || lpad(floor(random() * 1000000000000)::bigint::text, 12, '0')
WHERE "transactionId" LIKE 'pi_%';
