import { ExtraServiceType, PrismaClient, RoleKey } from "@prisma/client";

const prisma = new PrismaClient();
const AUTH_ADMIN_PERMISSION = "auth:admin";
const runtime = globalThis as unknown as {
  process: {
    exitCode?: number;
  };
};

const DEFAULT_ROLES: Array<{ key: RoleKey; name: string }> = [
  { key: RoleKey.SUPER_ADMIN, name: "Super Admin" },
  { key: RoleKey.DRIVER, name: "Driver" },
  { key: RoleKey.CUSTOMER, name: "Customer" },
  { key: RoleKey.BUSINESS_CUSTOMER, name: "Business Customer" },
  { key: RoleKey.VIP_CUSTOMER, name: "VIP Customer" },
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

async function seedAuthAdminPermission() {
  const permission = await prisma.permission.upsert({
    where: { key: AUTH_ADMIN_PERMISSION },
    update: {},
    create: {
      key: AUTH_ADMIN_PERMISSION,
      description: "Access to authentication administration endpoints",
    },
  });
  const superAdminRole = await prisma.role.findUniqueOrThrow({
    where: { key: RoleKey.SUPER_ADMIN },
  });

  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: superAdminRole.id,
        permissionId: permission.id,
      },
    },
    update: {},
    create: {
      roleId: superAdminRole.id,
      permissionId: permission.id,
    },
  });
}

async function seedSuperAdmin() {
  const email = "info@thedevsquare.com";
  const password = "Thedevsquare0345";

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
  isSpecial: boolean;
  price?: number;
  isActive: boolean;
}> = [
  // Standard Luggage
  {
    name: "Large Case",
    description: "Standard large suitcase",
    dimensions: "85cm × 55cm × 35cm",
    isSpecial: false,
    isActive: true,
  },
  {
    name: "Medium Case",
    description: "Standard medium suitcase",
    dimensions: "68cm × 45cm × 28cm",
    isSpecial: false,
    isActive: true,
  },
  {
    name: "Cabin Bag",
    description: "Carry-on cabin bag",
    dimensions: "55cm × 40cm × 20cm",
    isSpecial: false,
    isActive: true,
  },
  // Special Luggage
  {
    name: "Bicycle",
    description: "Special luggage: bicycle",
    dimensions: "175cm × 100cm × 40cm",
    price: 15,
    isSpecial: true,
    isActive: true,
  },
  {
    name: "Winter Sport",
    description: "Special luggage: winter sports equipment",
    dimensions: "190cm × 35cm × 20cm",
    price: 15,
    isSpecial: true,
    isActive: true,
  },
  {
    name: "Stroller",
    description: "Special luggage: baby stroller",
    dimensions: "100cm × 60cm × 45cm",
    price: 10,
    isSpecial: true,
    isActive: true,
  },
  {
    name: "Golf Bag",
    description: "Special luggage: golf bag",
    dimensions: "125cm × 30cm × 30cm",
    price: 15,
    isSpecial: true,
    isActive: true,
  },
  {
    name: "Ski",
    description: "Special luggage: ski equipment",
    dimensions: "200cm × 30cm × 20cm",
    price: 15,
    isSpecial: true,
    isActive: true,
  },
  {
    name: "Wheelchair",
    description: "Special luggage: wheelchair",
    dimensions: "110cm × 65cm × 95cm",
    price: 0,
    isSpecial: true,
    isActive: true,
  },
];

async function ensureLuggages() {
  for (const luggage of DEFAULT_LUGGAGES) {
    const existing = await prisma.luggageType.findFirst({
      where: {
        name: luggage.name,
        isSpecial: luggage.isSpecial,
      },
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
      { name: "Cabin Bag", quantity: 2 },
      { name: "Medium Case", quantity: 2 },
      { name: "Large Case", quantity: 2 },
      { name: "Stroller", quantity: 1 },
      { name: "Golf Bag", quantity: 1 },
      { name: "Ski", quantity: 1 },
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
  {
    name: "Meet & Greet",
    description: "Driver welcomes you inside the arrival hall with a name sign",
    price: 15,
    type: ExtraServiceType.MEET_AND_GREET,
    maxQuantity: 1,
    sortOrder: 4,
    isActive: true,
  },
  {
    name: "Additional Stop",
    description: "Additional stop along the route",
    price: 10,
    type: ExtraServiceType.EXTRA,
    maxQuantity: 4,
    sortOrder: 5,
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

async function main() {
  await ensureRoles();
  await seedAuthAdminPermission();
  await seedSuperAdmin();
  await ensureLuggages();
  await removeVanCategory();
  await ensureVehicleCategories();
  await ensureCategoryLuggageCapacities();
  await ensureExtraServices();
}

main()
  .catch((error) => {
    console.error(error);
    runtime.process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
