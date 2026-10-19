-- DropIndex
DROP INDEX IF EXISTS "VehicleCategory_sortOrder_idx";

-- AlterTable
ALTER TABLE "VehicleCategory" DROP COLUMN IF EXISTS "sortOrder";
