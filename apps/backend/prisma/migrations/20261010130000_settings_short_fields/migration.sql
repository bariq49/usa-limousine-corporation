-- AlterTable CustomerSettings
ALTER TABLE "CustomerSettings" RENAME COLUMN "emailNotification" TO "email";
ALTER TABLE "CustomerSettings" RENAME COLUMN "pushNotification" TO "push";

-- AlterTable DriverSettings
ALTER TABLE "DriverSettings" RENAME COLUMN "emailNotification" TO "email";
ALTER TABLE "DriverSettings" RENAME COLUMN "pushNotification" TO "push";
