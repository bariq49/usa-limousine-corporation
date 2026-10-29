-- Drop PER_HOUR distance slabs if that enum value exists, then restore PricingType without it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'PricingType' AND e.enumlabel = 'PER_HOUR'
  ) THEN
    DELETE FROM "VehicleCategoryPricing" WHERE "pricingType"::text = 'PER_HOUR';
    CREATE TYPE "PricingType_new" AS ENUM ('FIXED', 'PER_UNIT', 'PERCENTAGE');
    ALTER TABLE "VehicleCategoryPricing"
      ALTER COLUMN "pricingType" TYPE "PricingType_new"
      USING ("pricingType"::text::"PricingType_new");
    DROP TYPE "PricingType";
    ALTER TYPE "PricingType_new" RENAME TO "PricingType";
  END IF;
END $$;

CREATE TABLE "HourlyPricing" (
    "id" TEXT NOT NULL,
    "vehicleCategoryId" TEXT NOT NULL,
    "durationHours" INTEGER NOT NULL,
    "basePrice" DECIMAL(12,2) NOT NULL,
    "includedDistance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "extraDistanceRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "PricingStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HourlyPricing_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "HourlyPricing_status_durationHours_idx" ON "HourlyPricing"("status", "durationHours");

CREATE UNIQUE INDEX "HourlyPricing_vehicleCategoryId_durationHours_key" ON "HourlyPricing"("vehicleCategoryId", "durationHours");

ALTER TABLE "HourlyPricing" ADD CONSTRAINT "HourlyPricing_vehicleCategoryId_fkey" FOREIGN KEY ("vehicleCategoryId") REFERENCES "VehicleCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
