import type { PrismaClient } from "@prisma/client";

export function linkGuestBookings(prisma: Pick<PrismaClient, "$executeRaw">, userId: string) {
  return prisma.$executeRaw`
    UPDATE "Booking" b
    SET "userId" = u."id", "updatedAt" = NOW()
    FROM "User" u
    JOIN "UserRole" ur ON ur."userId" = u."id"
    JOIN "Role" r ON r."id" = ur."roleId" AND r."key" = 'CUSTOMER'
    WHERE u."id" = ${userId}
      AND u."isEmailVerified" = true
      AND u."isActive" = true
      AND b."userId" IS NULL
      AND b."deletedAt" IS NULL
      AND lower(b."passenger"->>'email') = lower(u."email")
  `;
}
