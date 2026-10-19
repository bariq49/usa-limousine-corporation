-- LuggageType.price and VehicleCategoryPricing money/distance fields:
-- Decimal → Float so API JSON returns numbers (not strings).

ALTER TABLE "LuggageType"
ALTER COLUMN "price" TYPE DOUBLE PRECISION
USING "price"::double precision;

ALTER TABLE "VehicleCategoryPricing"
ALTER COLUMN "minimumDistance" TYPE DOUBLE PRECISION
USING "minimumDistance"::double precision;

ALTER TABLE "VehicleCategoryPricing"
ALTER COLUMN "maximumDistance" TYPE DOUBLE PRECISION
USING "maximumDistance"::double precision;

ALTER TABLE "VehicleCategoryPricing"
ALTER COLUMN "basePrice" TYPE DOUBLE PRECISION
USING "basePrice"::double precision;

ALTER TABLE "VehicleCategoryPricing"
ALTER COLUMN "perUnitRate" TYPE DOUBLE PRECISION
USING "perUnitRate"::double precision;

ALTER TABLE "VehicleCategoryPricing"
ALTER COLUMN "percentageRate" TYPE DOUBLE PRECISION
USING "percentageRate"::double precision;
