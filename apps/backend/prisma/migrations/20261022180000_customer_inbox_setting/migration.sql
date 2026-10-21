-- AlterTable
ALTER TABLE "CustomerSettings" DROP COLUMN "push",
ADD COLUMN     "inbox" BOOLEAN NOT NULL DEFAULT true;

