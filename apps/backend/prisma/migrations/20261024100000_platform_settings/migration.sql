-- CreateEnum
CREATE TYPE "NoticeUnit" AS ENUM ('HOUR', 'MINUTE');

-- CreateTable
CREATE TABLE "PlatformSettings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "fuelSurchargeRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "gratuityRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "transactionFeeRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "oneWayDiscountRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "returnDiscountRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "airportPickupFee" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "stopFee" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "meetAndGreetFee" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "minBookingNotice" INTEGER NOT NULL DEFAULT 0,
    "minBookingNoticeUnit" "NoticeUnit" NOT NULL DEFAULT 'HOUR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformSettings_pkey" PRIMARY KEY ("id")
);

-- Seed the single settings row, carrying over today's catalog prices for stops and meet & greet.
INSERT INTO "PlatformSettings" ("id", "stopFee", "meetAndGreetFee", "updatedAt")
VALUES (
    'global',
    COALESCE((
        SELECT "price" FROM "ExtraService"
        WHERE "deletedAt" IS NULL AND "type" = 'EXTRA' AND LOWER("name") LIKE '%stop%'
        ORDER BY "sortOrder" LIMIT 1
    ), 0),
    COALESCE((
        SELECT "price" FROM "ExtraService"
        WHERE "deletedAt" IS NULL AND "type" = 'MEET_AND_GREET'
        ORDER BY "sortOrder" LIMIT 1
    ), 0),
    CURRENT_TIMESTAMP
);

-- Stops and meet & greet are now platform fees, not selectable extras.
UPDATE "ExtraService"
SET "deletedAt" = CURRENT_TIMESTAMP, "isActive" = false
WHERE "deletedAt" IS NULL
  AND ("type" = 'MEET_AND_GREET' OR ("type" = 'EXTRA' AND LOWER("name") LIKE '%stop%'));

UPDATE "ExtraService" SET "type" = 'EXTRA' WHERE "type" = 'MEET_AND_GREET';

-- AlterEnum
ALTER TYPE "ExtraServiceType" RENAME TO "ExtraServiceType_old";
CREATE TYPE "ExtraServiceType" AS ENUM ('CHILD_SEAT', 'EXTRA');
ALTER TABLE "ExtraService" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "ExtraService" ALTER COLUMN "type" TYPE "ExtraServiceType" USING ("type"::text::"ExtraServiceType");
ALTER TABLE "ExtraService" ALTER COLUMN "type" SET DEFAULT 'EXTRA';
DROP TYPE "ExtraServiceType_old";
