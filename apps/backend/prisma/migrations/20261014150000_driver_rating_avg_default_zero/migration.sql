-- New drivers start at 0 until they receive real customer reviews.
ALTER TABLE "Driver" ALTER COLUMN "ratingAvg" SET DEFAULT 0;
UPDATE "Driver" SET "ratingAvg" = 0 WHERE "ratingCount" = 0;
