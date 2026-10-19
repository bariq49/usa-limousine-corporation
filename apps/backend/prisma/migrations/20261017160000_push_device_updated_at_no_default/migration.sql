-- Prisma @updatedAt has no DB default; align applied schema with prisma schema.
ALTER TABLE "DriverPushDevice" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "CustomerPushDevice" ALTER COLUMN "updatedAt" DROP DEFAULT;
