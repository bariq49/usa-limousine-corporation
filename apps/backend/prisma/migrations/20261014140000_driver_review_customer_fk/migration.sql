-- Move DriverReview ownership from User → Customer (mirrors Driver.driverReviews).
ALTER TABLE "DriverReview" DROP CONSTRAINT IF EXISTS "DriverReview_userId_fkey";
DROP INDEX IF EXISTS "DriverReview_userId_idx";

ALTER TABLE "DriverReview" ADD COLUMN IF NOT EXISTS "customerId" TEXT;

-- Backfill from Customer.userId when migrating existing rows.
UPDATE "DriverReview" AS dr
SET "customerId" = c.id
FROM "Customer" AS c
WHERE dr."customerId" IS NULL
  AND c."userId" = dr."userId";

DELETE FROM "DriverReview" WHERE "customerId" IS NULL;

ALTER TABLE "DriverReview" ALTER COLUMN "customerId" SET NOT NULL;

ALTER TABLE "DriverReview" DROP COLUMN IF EXISTS "userId";

CREATE INDEX IF NOT EXISTS "DriverReview_customerId_idx" ON "DriverReview"("customerId");

ALTER TABLE "DriverReview" DROP CONSTRAINT IF EXISTS "DriverReview_customerId_fkey";
ALTER TABLE "DriverReview"
  ADD CONSTRAINT "DriverReview_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
