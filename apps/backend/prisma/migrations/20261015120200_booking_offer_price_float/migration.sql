-- BookingOffer money fields: Decimal → Float so API JSON returns numbers.

ALTER TABLE "BookingOffer"
ALTER COLUMN "quotedPrice" TYPE DOUBLE PRECISION
USING "quotedPrice"::double precision;

ALTER TABLE "BookingOffer"
ALTER COLUMN "fairPriceDelta" TYPE DOUBLE PRECISION
USING "fairPriceDelta"::double precision;
