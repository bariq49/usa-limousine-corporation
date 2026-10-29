-- Hourly pricing is by duration only (no mileage allowance / overage).
ALTER TABLE "HourlyPricing" DROP COLUMN IF EXISTS "includedDistance";
ALTER TABLE "HourlyPricing" DROP COLUMN IF EXISTS "extraDistanceRate";
