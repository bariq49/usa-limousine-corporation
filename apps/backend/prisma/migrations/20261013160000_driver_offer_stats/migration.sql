-- Denormalized driver marketplace stats for offer cards (hot-path reads).
ALTER TABLE "Driver"
  ADD COLUMN IF NOT EXISTS "ratingAvg" DOUBLE PRECISION NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS "ratingCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "completedTrips" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS "Driver_completedTrips_idx" ON "Driver"("completedTrips");
CREATE INDEX IF NOT EXISTS "Driver_ratingAvg_idx" ON "Driver"("ratingAvg");
