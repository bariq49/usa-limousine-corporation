-- DropIndex
DROP INDEX IF EXISTS "VehicleCategory_slug_key";

-- AlterTable
ALTER TABLE "VehicleCategory" DROP COLUMN IF EXISTS "slug";
