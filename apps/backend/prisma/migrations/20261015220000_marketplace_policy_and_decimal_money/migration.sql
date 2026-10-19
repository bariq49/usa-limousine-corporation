-- Revert catalogue / offer money fields to Decimal for precision.
ALTER TABLE "ExtraService"
ALTER COLUMN "price" TYPE DECIMAL(12, 2)
USING ROUND("price"::numeric, 2);

ALTER TABLE "LuggageType"
ALTER COLUMN "price" TYPE DECIMAL(12, 2)
USING ROUND("price"::numeric, 2);

ALTER TABLE "VehicleCategoryPricing"
ALTER COLUMN "minimumDistance" TYPE DECIMAL(12, 2)
USING ROUND("minimumDistance"::numeric, 2);

ALTER TABLE "VehicleCategoryPricing"
ALTER COLUMN "maximumDistance" TYPE DECIMAL(12, 2)
USING ROUND("maximumDistance"::numeric, 2);

ALTER TABLE "VehicleCategoryPricing"
ALTER COLUMN "basePrice" TYPE DECIMAL(12, 2)
USING ROUND("basePrice"::numeric, 2);

ALTER TABLE "VehicleCategoryPricing"
ALTER COLUMN "perUnitRate" TYPE DECIMAL(12, 2)
USING ROUND("perUnitRate"::numeric, 2);

ALTER TABLE "VehicleCategoryPricing"
ALTER COLUMN "percentageRate" TYPE DECIMAL(5, 2)
USING ROUND("percentageRate"::numeric, 2);

ALTER TABLE "BookingOffer"
ALTER COLUMN "quotedPrice" TYPE DECIMAL(14, 4)
USING ROUND("quotedPrice"::numeric, 4);

ALTER TABLE "BookingOffer"
ALTER COLUMN "fairPriceDelta" TYPE DECIMAL(14, 4)
USING ROUND("fairPriceDelta"::numeric, 4);

-- Marketplace cancel / payment / no-show policy knobs on platform settings.
ALTER TABLE "PlatformSettings"
ADD COLUMN IF NOT EXISTS "paymentTimeoutMin" INTEGER NOT NULL DEFAULT 15,
ADD COLUMN IF NOT EXISTS "cancelRefundBeforeStartPercent" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN IF NOT EXISTS "cancelRefundAfterStartPercent" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN IF NOT EXISTS "driverCancelRefundPercent" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN IF NOT EXISTS "driverCancelReseek" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "pickupFreeWaitMin" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN IF NOT EXISTS "noShowRefundPercent" INTEGER NOT NULL DEFAULT 0;
