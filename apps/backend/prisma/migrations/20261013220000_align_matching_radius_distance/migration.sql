-- Ensure Booking.matchingRadius / BookingOffer.distance exist under plain names (km).
-- Handles: never migrated, or earlier Km-suffixed columns.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Booking' AND column_name = 'matchingRadiusKm'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Booking' AND column_name = 'matchingRadius'
  ) THEN
    ALTER TABLE "Booking" RENAME COLUMN "matchingRadiusKm" TO "matchingRadius";
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Booking' AND column_name = 'matchingRadius'
  ) THEN
    ALTER TABLE "Booking" ADD COLUMN "matchingRadius" DOUBLE PRECISION;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'BookingOffer' AND column_name = 'distanceKm'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'BookingOffer' AND column_name = 'distance'
  ) THEN
    ALTER TABLE "BookingOffer" RENAME COLUMN "distanceKm" TO "distance";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'BookingOffer'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'BookingOffer' AND column_name = 'distance'
  ) THEN
    ALTER TABLE "BookingOffer" ADD COLUMN "distance" DOUBLE PRECISION;
  END IF;
END $$;
