-- CreateTable
CREATE TABLE "CustomerSettings" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "emailNotification" BOOLEAN NOT NULL DEFAULT true,
    "pushNotification" BOOLEAN NOT NULL DEFAULT true,
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Amsterdam',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerSettings_customerId_key" ON "CustomerSettings"("customerId");

-- AddForeignKey
ALTER TABLE "CustomerSettings" ADD CONSTRAINT "CustomerSettings_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
