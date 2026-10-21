-- Schema integrity pass: real foreign keys, Decimal money, no duplicated columns.
-- Every step carries existing data over before dropping the old column/table.

-- =========================================================== Sequences
CREATE TABLE "Sequence" (
    "id" TEXT NOT NULL,
    "lastValue" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sequence_pkey" PRIMARY KEY ("id")
);

INSERT INTO "Sequence" ("id", "lastValue", "updatedAt")
SELECT 'booking', "lastValue", CURRENT_TIMESTAMP FROM "BookingSequence" WHERE "id" = 'global';
INSERT INTO "Sequence" ("id", "lastValue", "updatedAt")
SELECT 'help-ticket', "lastValue", CURRENT_TIMESTAMP FROM "HelpTicketSequence" WHERE "id" = 'global';

DROP TABLE "BookingSequence";
DROP TABLE "HelpTicketSequence";

-- =========================================================== Money: Float -> Decimal
ALTER TABLE "ExtraService" ALTER COLUMN "price" SET DATA TYPE DECIMAL(12,2) USING ROUND("price"::numeric, 2);
ALTER TABLE "LuggageType" ALTER COLUMN "price" SET DATA TYPE DECIMAL(12,2) USING ROUND("price"::numeric, 2);
ALTER TABLE "VehicleCategoryPricing"
  ALTER COLUMN "basePrice" SET DATA TYPE DECIMAL(12,2) USING ROUND("basePrice"::numeric, 2),
  ALTER COLUMN "perUnitRate" SET DATA TYPE DECIMAL(12,4) USING ROUND("perUnitRate"::numeric, 4),
  ALTER COLUMN "percentageRate" SET DATA TYPE DECIMAL(7,4) USING ROUND("percentageRate"::numeric, 4);

-- =========================================================== Luggage names unique
-- Rename any duplicates ("Name (2)", ...) so the unique index can be created.
WITH ranked AS (
  SELECT "id", "name", ROW_NUMBER() OVER (PARTITION BY "name" ORDER BY "createdAt", "id") AS rn
  FROM "LuggageType"
)
UPDATE "LuggageType" l SET "name" = l."name" || ' (' || ranked.rn || ')'
FROM ranked WHERE ranked."id" = l."id" AND ranked.rn > 1;
CREATE UNIQUE INDEX "LuggageType_name_key" ON "LuggageType"("name");

-- =========================================================== Booking
ALTER TABLE "Booking" RENAME COLUMN "driverNotes" TO "notes";

ALTER TABLE "Booking"
  ADD COLUMN "totalPrice" DECIMAL(12,2),
  ADD COLUMN "currency" VARCHAR(3) NOT NULL DEFAULT 'EUR';
UPDATE "Booking"
SET "totalPrice" = CASE
  WHEN ("pricing"->>'total') ~ '^-?[0-9]+(\.[0-9]+)?$' THEN ROUND(("pricing"->>'total')::numeric, 2)
  ELSE 0
END;
ALTER TABLE "Booking" ALTER COLUMN "totalPrice" SET NOT NULL;

-- Deleting a user keeps their booking history.
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_userId_fkey";
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

DROP INDEX "Booking_userId_idx";
DROP INDEX "Booking_deletedAt_idx";
CREATE INDEX "Booking_userId_createdAt_idx" ON "Booking"("userId", "createdAt");
CREATE INDEX "Booking_deletedAt_createdAt_idx" ON "Booking"("deletedAt", "createdAt");

-- Luggage: snapshot the price per item.
ALTER TABLE "BookingLuggage" ADD COLUMN "unitPrice" DECIMAL(12,2) NOT NULL DEFAULT 0;
UPDATE "BookingLuggage" bl SET "unitPrice" = COALESCE(lt."price", 0)
FROM "LuggageType" lt WHERE lt."id" = bl."luggageTypeId";
DROP INDEX "BookingLuggage_bookingId_idx";

-- Extra services: JSON array -> rows with a price snapshot.
CREATE TABLE "BookingExtraService" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "extraServiceId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "BookingExtraService_pkey" PRIMARY KEY ("id")
);

INSERT INTO "BookingExtraService" ("id", "bookingId", "extraServiceId", "quantity", "unitPrice")
SELECT
  'bes_' || md5(b."id" || ':' || es."id"),
  b."id",
  es."id",
  GREATEST(SUM(COALESCE(NULLIF(item->>'quantity', '')::int, 1)), 1),
  ROUND(MAX(
    CASE WHEN (item->>'price') ~ '^-?[0-9]+(\.[0-9]+)?$' THEN (item->>'price')::numeric ELSE es."price" END
  ), 2)
FROM "Booking" b
CROSS JOIN LATERAL jsonb_array_elements(
  CASE WHEN jsonb_typeof(b."extraServices") = 'array' THEN b."extraServices" ELSE '[]'::jsonb END
) AS item
JOIN "ExtraService" es ON es."id" = item->>'extraServiceId'
GROUP BY b."id", es."id";

ALTER TABLE "Booking" DROP COLUMN "extraServices";

CREATE INDEX "BookingExtraService_extraServiceId_idx" ON "BookingExtraService"("extraServiceId");
CREATE UNIQUE INDEX "BookingExtraService_bookingId_extraServiceId_key" ON "BookingExtraService"("bookingId", "extraServiceId");
ALTER TABLE "BookingExtraService" ADD CONSTRAINT "BookingExtraService_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BookingExtraService" ADD CONSTRAINT "BookingExtraService_extraServiceId_fkey" FOREIGN KEY ("extraServiceId") REFERENCES "ExtraService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- =========================================================== Help tickets -> Customer FK
ALTER TABLE "HelpTicket" ADD COLUMN "customerId" TEXT;
UPDATE "HelpTicket" t SET "customerId" = c."id"
FROM "Customer" c WHERE c."id" = t."ownerId" AND t."ownerType" = 'CUSTOMER';
-- Tickets whose customer no longer exists cannot be linked.
DELETE FROM "HelpTicket" WHERE "customerId" IS NULL;
ALTER TABLE "HelpTicket" ALTER COLUMN "customerId" SET NOT NULL;

DROP INDEX "HelpTicket_ownerType_ownerId_idx";
ALTER TABLE "HelpTicket" DROP COLUMN "ownerType", DROP COLUMN "ownerId", DROP COLUMN "ownerName", DROP COLUMN "ownerEmail";
DROP TYPE "HelpTicketOwnerType";
CREATE INDEX "HelpTicket_customerId_createdAt_idx" ON "HelpTicket"("customerId", "createdAt");
ALTER TABLE "HelpTicket" ADD CONSTRAINT "HelpTicket_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Categories: drop driver-era values, add BOOKING.
CREATE TYPE "HelpTicketCategory_new" AS ENUM ('ACCOUNT', 'BOOKING', 'PAYMENTS', 'APP', 'OTHER');
ALTER TABLE "HelpTicket" ALTER COLUMN "category" DROP DEFAULT;
ALTER TABLE "HelpTicket" ALTER COLUMN "category" TYPE "HelpTicketCategory_new" USING (
  CASE "category"::text
    WHEN 'TRIPS' THEN 'BOOKING'
    WHEN 'PASSENGER_NO_SHOW' THEN 'BOOKING'
    WHEN 'DOCUMENTS' THEN 'ACCOUNT'
    WHEN 'VEHICLE' THEN 'OTHER'
    WHEN 'FLAT_TIRE' THEN 'OTHER'
    ELSE "category"::text
  END
)::"HelpTicketCategory_new";
ALTER TYPE "HelpTicketCategory" RENAME TO "HelpTicketCategory_old";
ALTER TYPE "HelpTicketCategory_new" RENAME TO "HelpTicketCategory";
DROP TYPE "HelpTicketCategory_old";
ALTER TABLE "HelpTicket" ALTER COLUMN "category" SET DEFAULT 'OTHER';

-- =========================================================== Activity -> Customer / User FKs
ALTER TABLE "Activity" ADD COLUMN "customerId" TEXT, ADD COLUMN "actorUserId" TEXT;
UPDATE "Activity" a SET "customerId" = c."id"
FROM "Customer" c WHERE a."ownerType" = 'CUSTOMER' AND c."id" = a."ownerId";
UPDATE "Activity" a SET "customerId" = c."id"
FROM "Customer" c WHERE a."customerId" IS NULL AND a."ownerType" = 'USER' AND c."userId" = a."ownerId";
UPDATE "Activity" a SET "actorUserId" = u."id"
FROM "User" u WHERE u."id" = a."actorId";
DELETE FROM "Activity" WHERE "customerId" IS NULL;
ALTER TABLE "Activity" ALTER COLUMN "customerId" SET NOT NULL;

DROP INDEX "Activity_ownerType_ownerId_createdAt_idx";
DROP INDEX "Activity_createdAt_idx";
ALTER TABLE "Activity" DROP COLUMN "ownerType", DROP COLUMN "ownerId", DROP COLUMN "actorType", DROP COLUMN "actorId";
DROP TYPE "ActivityOwnerType";
CREATE INDEX "Activity_customerId_createdAt_idx" ON "Activity"("customerId", "createdAt");
CREATE INDEX "Activity_actorUserId_idx" ON "Activity"("actorUserId");
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- =========================================================== Notifications -> User FK
DELETE FROM "Notification" n WHERE NOT EXISTS (SELECT 1 FROM "User" u WHERE u."id" = n."recipientId");
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- =========================================================== Customer / User duplicates
-- Keep legacy single tokens as push devices before dropping the copy.
INSERT INTO "CustomerPushDevice" ("id", "customerId", "token", "deviceId", "platform", "createdAt", "updatedAt")
SELECT 'cpd_' || md5(c."id" || ':' || c."fcmToken"), c."id", c."fcmToken", NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Customer" c
WHERE c."fcmToken" IS NOT NULL AND c."fcmToken" <> ''
  AND NOT EXISTS (SELECT 1 FROM "CustomerPushDevice" d WHERE d."token" = c."fcmToken");
-- Account deactivation is User.isActive (enforced at login).
UPDATE "User" u SET "isActive" = false FROM "Customer" c WHERE c."userId" = u."id" AND c."isActive" = false;
ALTER TABLE "Customer" DROP COLUMN "fcmToken", DROP COLUMN "isActive";
ALTER TABLE "User" DROP COLUMN "defaultAdminEmail";

-- =========================================================== Roles / permissions
DELETE FROM "UserRole" ur USING "Role" r
WHERE ur."roleId" = r."id" AND r."key"::text NOT IN ('SUPER_ADMIN', 'CUSTOMER');
DELETE FROM "Role" WHERE "key"::text NOT IN ('SUPER_ADMIN', 'CUSTOMER');
CREATE TYPE "RoleKey_new" AS ENUM ('SUPER_ADMIN', 'CUSTOMER');
ALTER TABLE "Role" ALTER COLUMN "key" TYPE "RoleKey_new" USING ("key"::text::"RoleKey_new");
ALTER TYPE "RoleKey" RENAME TO "RoleKey_old";
ALTER TYPE "RoleKey_new" RENAME TO "RoleKey";
DROP TYPE "RoleKey_old";
CREATE INDEX "UserRole_roleId_idx" ON "UserRole"("roleId");

DROP TABLE "RolePermission";
DROP TABLE "Permission";
