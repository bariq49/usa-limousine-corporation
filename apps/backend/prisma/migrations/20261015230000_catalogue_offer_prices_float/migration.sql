-- Catalogue / offer money fields: Decimal → Float so API JSON returns numbers.

ALTER TABLE "ExtraService"
ALTER COLUMN "price" TYPE DOUBLE PRECISION
USING "price"::double precision;

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

ALTER TABLE "BookingOffer"
ALTER COLUMN "quotedPrice" TYPE DOUBLE PRECISION
USING "quotedPrice"::double precision;

ALTER TABLE "BookingOffer"
ALTER COLUMN "fairPriceDelta" TYPE DOUBLE PRECISION
USING "fairPriceDelta"::double precision;
