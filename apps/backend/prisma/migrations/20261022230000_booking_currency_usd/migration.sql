-- The platform bills in US dollars.
ALTER TABLE "Booking" ALTER COLUMN "currency" SET DEFAULT 'USD';
UPDATE "Booking" SET "currency" = 'USD' WHERE "currency" = 'EUR';
