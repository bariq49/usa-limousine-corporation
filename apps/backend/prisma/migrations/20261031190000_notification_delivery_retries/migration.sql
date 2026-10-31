ALTER TABLE "Notification"
ADD COLUMN "deliveryAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "nextDeliveryAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "deliveryLockedUntil" TIMESTAMP(3),
ADD COLUMN "deadLetteredAt" TIMESTAMP(3),
ADD COLUMN "lastDeliveryError" TEXT;

CREATE INDEX "Notification_delivery_pending_idx"
ON "Notification"("deliveredAt", "deadLetteredAt", "nextDeliveryAt", "createdAt");

CREATE INDEX "Notification_dead_letter_idx"
ON "Notification"("deadLetteredAt", "createdAt");
