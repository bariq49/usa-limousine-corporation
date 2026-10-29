import { PrismaClient, RoleKey } from "@prisma/client";

const prisma = new PrismaClient();
const runtime = globalThis as unknown as {
  process: {
    exitCode?: number;
  };
};

const DEFAULT_ROLES: Array<{ key: RoleKey; name: string }> = [
  { key: RoleKey.SUPER_ADMIN, name: "Super Admin" },
  { key: RoleKey.CUSTOMER, name: "Customer" },
];

const SUPER_ADMINS: Array<{ email: string; password: string }> = [
  { email: "info@thedevsquare.com", password: "Thedevsquare0345" },
  { email: "info@usalimocorp.com", password: "ChangeMe123$$" },
];

async function ensureRoles() {
  for (const role of DEFAULT_ROLES) {
    await prisma.role.upsert({
      where: { key: role.key },
      update: { name: role.name },
      create: role,
    });
  }
}

async function seedSuperAdmin(email: string, password: string) {
  const argon2 = await import("argon2");
  const passwordHash = await argon2.hash(password);
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      firstName: "Super",
      lastName: "Admin",
      passwordHash,
      isEmailVerified: true,
      isActive: true,
      failedLoginCount: 0,
      lockoutUntil: null,
    },
    create: {
      email,
      firstName: "Super",
      lastName: "Admin",
      passwordHash,
      isEmailVerified: true,
      isActive: true,
    },
  });

  const role = await prisma.role.findUniqueOrThrow({
    where: { key: RoleKey.SUPER_ADMIN },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId: role.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      roleId: role.id,
    },
  });

  console.log(`Seeded SUPER_ADMIN ${email}`);
}

async function main() {
  await ensureRoles();
  for (const admin of SUPER_ADMINS) {
    await seedSuperAdmin(admin.email, admin.password);
  }
}

main()
  .catch((error) => {
    console.error(error);
    runtime.process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
