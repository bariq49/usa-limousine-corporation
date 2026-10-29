-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "HelpTicketSource" AS ENUM ('PORTAL', 'WEBSITE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable
ALTER TABLE "HelpTicket" ADD COLUMN IF NOT EXISTS "contactEmail" TEXT,
ADD COLUMN IF NOT EXISTS "contactName" TEXT,
ADD COLUMN IF NOT EXISTS "contactPhone" TEXT,
ADD COLUMN IF NOT EXISTS "source" "HelpTicketSource" NOT NULL DEFAULT 'PORTAL',
ALTER COLUMN "customerId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "HelpTicket_source_idx" ON "HelpTicket"("source");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "HelpTicket_contactEmail_idx" ON "HelpTicket"("contactEmail");
