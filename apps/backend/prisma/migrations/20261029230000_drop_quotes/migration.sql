-- DropQuote
ALTER TABLE "Booking" DROP CONSTRAINT IF EXISTS "Booking_quoteId_fkey";
DROP INDEX IF EXISTS "Booking_quoteId_key";
ALTER TABLE "Booking" DROP COLUMN IF EXISTS "quoteId";

ALTER TABLE "Quote" DROP CONSTRAINT IF EXISTS "Quote_vehicleCategoryId_fkey";
DROP INDEX IF EXISTS "Quote_expiresAt_idx";
DROP TABLE IF EXISTS "Quote";
