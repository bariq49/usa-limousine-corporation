UPDATE "Customer" SET "type" = 'CORPORATE' WHERE "type" = 'VIP';

ALTER TYPE "CustomerType" RENAME TO "CustomerType_old";
CREATE TYPE "CustomerType" AS ENUM ('NORMAL', 'CORPORATE');
ALTER TABLE "Customer" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Customer"
  ALTER COLUMN "type" TYPE "CustomerType"
  USING ("type"::text::"CustomerType");
ALTER TABLE "Customer" ALTER COLUMN "type" SET DEFAULT 'NORMAL'::"CustomerType";
DROP TYPE "CustomerType_old";
