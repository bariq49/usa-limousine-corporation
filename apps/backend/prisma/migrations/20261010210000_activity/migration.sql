-- CreateEnum
CREATE TYPE "ActivityOwnerType" AS ENUM ('DRIVER', 'CUSTOMER', 'USER');

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "ownerType" "ActivityOwnerType" NOT NULL,
    "ownerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "actorType" "ActivityOwnerType",
    "actorId" TEXT,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Activity_ownerType_ownerId_createdAt_idx" ON "Activity"("ownerType", "ownerId", "createdAt");

-- CreateIndex
CREATE INDEX "Activity_type_idx" ON "Activity"("type");

-- CreateIndex
CREATE INDEX "Activity_createdAt_idx" ON "Activity"("createdAt");
