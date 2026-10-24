-- Attach existing guest bookings to the verified customer account with the same email
UPDATE "Booking" b
SET "userId" = u."id", "updatedAt" = NOW()
FROM "User" u
JOIN "UserRole" ur ON ur."userId" = u."id"
JOIN "Role" r ON r."id" = ur."roleId" AND r."key" = 'CUSTOMER'
WHERE u."isEmailVerified" = true
  AND u."isActive" = true
  AND b."userId" IS NULL
  AND b."deletedAt" IS NULL
  AND lower(b."passenger"->>'email') = lower(u."email");
