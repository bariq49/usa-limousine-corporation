-- AlterTable
ALTER TABLE "VehicleCategory" ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "VehicleCategory_sortOrder_idx" ON "VehicleCategory"("sortOrder");
