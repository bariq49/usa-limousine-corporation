-- ExtraService.price: Decimal → Float so API JSON returns a number (not a string).
ALTER TABLE "ExtraService"
ALTER COLUMN "price" TYPE DOUBLE PRECISION
USING "price"::double precision;
