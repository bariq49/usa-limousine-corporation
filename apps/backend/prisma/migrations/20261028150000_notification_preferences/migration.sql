-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "notifyByEmail" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "notifyBySms" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "PlatformSettings" ADD COLUMN "emailNotificationFee" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN "smsNotificationFee" DECIMAL(12,2) NOT NULL DEFAULT 0;
