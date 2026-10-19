-- Idempotent safety net: ensure VehicleCategory matches the current Prisma schema.
-- Safe to run on DBs that already applied the earlier slug/sortOrder/image migrations.

DROP INDEX IF EXISTS "VehicleCategory_slug_key";
ALTER TABLE "VehicleCategory" DROP COLUMN IF EXISTS "slug";

DROP INDEX IF EXISTS "VehicleCategory_sortOrder_idx";
ALTER TABLE "VehicleCategory" DROP COLUMN IF EXISTS "sortOrder";

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'VehicleCategory'
      AND column_name = 'imageUrl'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'VehicleCategory'
      AND column_name = 'image'
  ) THEN
    ALTER TABLE "VehicleCategory" RENAME COLUMN "imageUrl" TO "image";
  END IF;
END $$;
