-- CreateEnum
CREATE TYPE "HelpTicketOwnerType" AS ENUM ('DRIVER', 'CUSTOMER');

-- AlterTable: polymorphic owner (generic help-center; no Driver/Customer FKs)
ALTER TABLE "HelpTicket" ADD COLUMN "ownerType" "HelpTicketOwnerType";
ALTER TABLE "HelpTicket" ADD COLUMN "ownerId" TEXT;

-- Backfill existing driver-owned tickets
UPDATE "HelpTicket"
SET "ownerType" = 'DRIVER', "ownerId" = "driverId"
WHERE "driverId" IS NOT NULL;

-- Backfill customer-owned tickets if intermediate column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'HelpTicket' AND column_name = 'customerId'
  ) THEN
    EXECUTE $sql$
      UPDATE "HelpTicket"
      SET "ownerType" = 'CUSTOMER', "ownerId" = "customerId"
      WHERE "customerId" IS NOT NULL AND "ownerId" IS NULL
    $sql$;
  END IF;
END $$;

-- Require owner
ALTER TABLE "HelpTicket" ALTER COLUMN "ownerType" SET NOT NULL;
ALTER TABLE "HelpTicket" ALTER COLUMN "ownerId" SET NOT NULL;

-- Drop legacy domain FKs / columns
ALTER TABLE "HelpTicket" DROP CONSTRAINT IF EXISTS "HelpTicket_driverId_fkey";
ALTER TABLE "HelpTicket" DROP CONSTRAINT IF EXISTS "HelpTicket_customerId_fkey";
DROP INDEX IF EXISTS "HelpTicket_driverId_idx";
DROP INDEX IF EXISTS "HelpTicket_customerId_idx";
ALTER TABLE "HelpTicket" DROP COLUMN IF EXISTS "driverId";
ALTER TABLE "HelpTicket" DROP COLUMN IF EXISTS "customerId";

-- CreateIndex
CREATE INDEX "HelpTicket_ownerType_ownerId_idx" ON "HelpTicket"("ownerType", "ownerId");
