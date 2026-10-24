-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('TEST', 'LIVE');

-- AlterTable
ALTER TABLE "PlatformSettings" ADD COLUMN "paymentMode" "PaymentMode" NOT NULL DEFAULT 'TEST';
