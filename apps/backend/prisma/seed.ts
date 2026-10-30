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

const VEHICLE_CATEGORIES: Array<{
  name: string;
  models: string;
  description: string;
  passengerCount: number;
  sortOrder: number;
}> = [
  {
    name: "Luxury Sedan",
    models: "Volvo S90, Cadillac CT6, Genesis G90 or similar",
    description:
      "Comfortable everyday travel with clean interiors, generous legroom, and reliable value. Ideal for simple, smooth transportation without compromise on safety or comfort.",
    passengerCount: 3,
    sortOrder: 1,
  },
  {
    name: "Premium Luxury Sedan",
    models: "Mercedes S-Class, BMW 7 Series or similar",
    description:
      "First-class comfort in a flagship sedan with a whisper-quiet cabin and refined finishes. Perfect for executives, VIP guests, and special occasions.",
    passengerCount: 3,
    sortOrder: 2,
  },
  {
    name: "Luxury SUV",
    models: "Chevrolet Suburban, GMC Yukon XL, Ford Expedition or similar",
    description:
      "Experience first-class transportation with generous passenger space, premium comfort, and an elevated ride. An excellent choice for airport service, business travel, and private events.",
    passengerCount: 6,
    sortOrder: 3,
  },
  {
    name: "Premium Luxury SUV",
    models: "Cadillac Escalade ESV, Lincoln Navigator L or similar",
    description:
      "The top-tier SUV experience with flagship amenities, leather seating, and plenty of room for passengers and luggage. Made for travel that makes a statement.",
    passengerCount: 6,
    sortOrder: 4,
  },
  {
    name: "Luxury SUV w/ Bench Seat",
    models: "Chevrolet Suburban, GMC Yukon XL, Ford Expedition or similar",
    description:
      "Enjoy premium travel with extra seating capacity, spacious interiors, and a smooth ride. Perfect for families, airport transfers, and group transportation.",
    passengerCount: 7,
    sortOrder: 5,
  },
  {
    name: "Passenger Van",
    models: "Mercedes Sprinter, Ford Transit or similar",
    description:
      "Premium group transportation with spacious interiors and room for luggage. Ideal for corporate groups, wedding parties, and airport runs for larger teams.",
    passengerCount: 12,
    sortOrder: 6,
  },
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

async function seedVehicleCategories() {
  for (const category of VEHICLE_CATEGORIES) {
    const existing = await prisma.vehicleCategory.findFirst({
      where: { name: category.name, deletedAt: null },
    });
    if (existing) {
      await prisma.vehicleCategory.update({
        where: { id: existing.id },
        data: { sortOrder: category.sortOrder },
      });
      continue;
    }
    await prisma.vehicleCategory.create({ data: category });
  }

  console.log(`Seeded ${VEHICLE_CATEGORIES.length} vehicle categories`);
}

async function main() {
  await ensureRoles();
  for (const admin of SUPER_ADMINS) {
    await seedSuperAdmin(admin.email, admin.password);
  }
  await seedVehicleCategories();
}

main()
  .catch((error) => {
    console.error(error);
    runtime.process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
