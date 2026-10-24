import { ExtraServiceType, PrismaClient, RoleKey } from "@prisma/client";

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

async function ensureRoles() {
  for (const role of DEFAULT_ROLES) {
    await prisma.role.upsert({
      where: { key: role.key },
      update: { name: role.name },
      create: role,
    });
  }
}

const SUPER_ADMINS: Array<{ email: string; password: string }> = [
  { email: "info@thedevsquare.com", password: "Thedevsquare0345" },
  { email: "info@usalimocorp.com", password: "ChangeMe123$$" },
];

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

const DEFAULT_LUGGAGES: Array<{
  name: string;
  description: string;
  dimensions?: string;
  price?: number;
  isActive: boolean;
}> = [
  {
    name: "Backpack",
    description: "Hand bags, backpack",
    isActive: true,
  },
  {
    name: "Carry-on",
    description: "Carry-on bag",
    dimensions: "54cm x 45cm x 25cm",
    isActive: true,
  },
  {
    name: "Large Bag",
    description: "Large suitcase",
    dimensions: "85cm x 55cm x 35cm",
    isActive: true,
  },
  {
    name: "Check-in Bag",
    description: "Checked suitcase",
    dimensions: "65cm x 45cm x 25cm",
    isActive: true,
  },
];

async function ensureLuggages() {
  for (const luggage of DEFAULT_LUGGAGES) {
    const existing = await prisma.luggageType.findFirst({
      where: { name: luggage.name },
    });

    if (existing) {
      await prisma.luggageType.update({
        where: { id: existing.id },
        data: {
          description: luggage.description,
          dimensions: luggage.dimensions ?? null,
          price: luggage.price !== undefined ? luggage.price : null,
          isActive: luggage.isActive,
        },
      });
    } else {
      await prisma.luggageType.create({
        data: luggage,
      });
    }
  }

  console.log(`Seeded ${DEFAULT_LUGGAGES.length} luggage types`);
}

/** Removes luggage types that are no longer in the defaults; ones used by bookings are deactivated. */
async function removeOldLuggages() {
  const oldLuggages = await prisma.luggageType.findMany({
    where: { name: { notIn: DEFAULT_LUGGAGES.map((luggage) => luggage.name) } },
    include: { _count: { select: { bookingSelections: true } } },
  });

  for (const luggage of oldLuggages) {
    await prisma.vehicleCategoryLuggageCapacity.deleteMany({ where: { luggageTypeId: luggage.id } });
    if (luggage._count.bookingSelections > 0) {
      await prisma.luggageType.update({ where: { id: luggage.id }, data: { isActive: false } });
    } else {
      await prisma.luggageType.delete({ where: { id: luggage.id } });
    }
  }

  console.log(`Removed ${oldLuggages.length} old luggage types`);
}

const DEFAULT_VEHICLE_CATEGORIES = [
  {
    name: "Sedan",
    description: "Comfortable standard sedan for up to 4 passengers",
    passengerCount: 4,
    isActive: true,
  },
];

async function removeVanCategory() {
  const van = await prisma.vehicleCategory.findFirst({
    where: { name: "Van", deletedAt: null },
  });
  if (!van) {
    return;
  }

  await prisma.vehicleCategoryLuggageCapacity.deleteMany({ where: { categoryId: van.id } });
  await prisma.vehicleCategoryPricing.deleteMany({ where: { vehicleCategoryId: van.id } });
  await prisma.vehicleCategory.delete({ where: { id: van.id } });
  console.log("Removed Van vehicle category");
}

async function ensureVehicleCategories() {
  for (const category of DEFAULT_VEHICLE_CATEGORIES) {
    const existing = await prisma.vehicleCategory.findFirst({
      where: { name: category.name, deletedAt: null },
    });

    if (existing) {
      await prisma.vehicleCategory.update({
        where: { id: existing.id },
        data: {
          name: category.name,
          description: category.description,
          passengerCount: category.passengerCount,
          isActive: category.isActive,
          deletedAt: null,
        },
      });
    } else {
      await prisma.vehicleCategory.create({
        data: category,
      });
    }
  }

  console.log(`Seeded ${DEFAULT_VEHICLE_CATEGORIES.length} vehicle categories`);
}

async function ensureCategoryLuggageCapacities() {
  const sedan = await prisma.vehicleCategory.findFirst({
    where: { name: "Sedan", deletedAt: null },
  });

  const allLuggages = await prisma.luggageType.findMany();
  const luggageMap = new Map(allLuggages.map((l) => [l.name, l.id]));

  if (sedan) {
    const sedanCapacities: Array<{ name: string; quantity: number }> = [
      { name: "Backpack", quantity: 2 },
      { name: "Carry-on", quantity: 2 },
      { name: "Large Bag", quantity: 2 },
      { name: "Check-in Bag", quantity: 2 },
    ];

    for (const item of sedanCapacities) {
      const luggageTypeId = luggageMap.get(item.name);
      if (luggageTypeId) {
        await prisma.vehicleCategoryLuggageCapacity.upsert({
          where: {
            categoryId_luggageTypeId: {
              categoryId: sedan.id,
              luggageTypeId,
            },
          },
          update: { quantity: item.quantity },
          create: {
            categoryId: sedan.id,
            luggageTypeId,
            quantity: item.quantity,
          },
        });
      }
    }
  }

  console.log("Seeded default vehicle category luggage capacities");
}

const DEFAULT_EXTRA_SERVICES = [
  {
    name: "Baby Seat",
    description: "Rear-facing seat for infants (0-13 kg)",
    price: 10,
    type: ExtraServiceType.CHILD_SEAT,
    maxQuantity: 2,
    sortOrder: 1,
    isActive: true,
  },
  {
    name: "Toddler Seat",
    description: "Forward-facing safety seat for toddlers (9-18 kg)",
    price: 10,
    type: ExtraServiceType.CHILD_SEAT,
    maxQuantity: 2,
    sortOrder: 2,
    isActive: true,
  },
  {
    name: "Booster Seat",
    description: "Booster seat for older children (15-36 kg)",
    price: 5,
    type: ExtraServiceType.CHILD_SEAT,
    maxQuantity: 3,
    sortOrder: 3,
    isActive: true,
  },
];

async function ensureExtraServices() {
  for (const service of DEFAULT_EXTRA_SERVICES) {
    const existing = await prisma.extraService.findFirst({
      where: {
        name: service.name,
        deletedAt: null,
      },
    });

    if (existing) {
      await prisma.extraService.update({
        where: { id: existing.id },
        data: {
          description: service.description,
          price: service.price,
          type: service.type,
          maxQuantity: service.maxQuantity,
          sortOrder: service.sortOrder,
          isActive: service.isActive,
        },
      });
    } else {
      await prisma.extraService.create({
        data: service,
      });
    }
  }

  console.log(`Seeded ${DEFAULT_EXTRA_SERVICES.length} extra services`);
}

/** Creates the single platform settings row; existing values are left as admins set them. */
async function ensurePlatformSettings() {
  await prisma.platformSettings.upsert({
    where: { id: "global" },
    create: { id: "global" },
    update: {},
  });
  console.log("Platform settings ready");
}

async function main() {
  await ensureRoles();
  for (const admin of SUPER_ADMINS) {
    await seedSuperAdmin(admin.email, admin.password);
  }
  await ensureLuggages();
  await removeOldLuggages();
  await removeVanCategory();
  await ensureVehicleCategories();
  await ensureCategoryLuggageCapacities();
  await ensureExtraServices();
  await ensurePlatformSettings();
}

main()
  .catch((error) => {
    console.error(error);
    runtime.process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
