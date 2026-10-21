-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "push" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Notification_deliveredAt_createdAt_idx" ON "Notification"("deliveredAt", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_readAt_createdAt_idx" ON "Notification"("readAt", "createdAt");


-- Rows created before this migration were already delivered.
UPDATE "Notification" SET "deliveredAt" = "createdAt" WHERE "deliveredAt" IS NULL;
