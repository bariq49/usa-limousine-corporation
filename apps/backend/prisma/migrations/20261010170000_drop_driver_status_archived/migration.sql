-- Soft-delete uses Driver.deletedAt; ARCHIVED status is unused.
UPDATE "Driver" SET "status" = 'INACTIVE' WHERE "status" = 'ARCHIVED';
UPDATE "DriverDeleteRequest" SET "previousStatus" = 'INACTIVE' WHERE "previousStatus" = 'ARCHIVED';

CREATE TYPE "DriverStatus_new" AS ENUM ('INVITED', 'PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'REJECTED');

ALTER TABLE "Driver"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "DriverStatus_new"
  USING ("status"::text::"DriverStatus_new");

ALTER TABLE "Driver"
  ALTER COLUMN "status" SET DEFAULT 'PENDING'::"DriverStatus_new";

ALTER TABLE "DriverDeleteRequest"
  ALTER COLUMN "previousStatus" TYPE "DriverStatus_new"
  USING ("previousStatus"::text::"DriverStatus_new");

DROP TYPE "DriverStatus";
ALTER TYPE "DriverStatus_new" RENAME TO "DriverStatus";

ALTER TABLE "Driver"
  ALTER COLUMN "status" SET DEFAULT 'PENDING'::"DriverStatus";
