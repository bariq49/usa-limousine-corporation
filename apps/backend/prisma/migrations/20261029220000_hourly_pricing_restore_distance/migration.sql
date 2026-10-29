-- Hourly packages keep an included mileage allowance and overage rate.
ALTER TABLE "HourlyPricing" ADD COLUMN IF NOT EXISTS "includedDistance" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "HourlyPricing" ADD COLUMN IF NOT EXISTS "extraDistanceRate" DOUBLE PRECISION NOT NULL DEFAULT 0;
