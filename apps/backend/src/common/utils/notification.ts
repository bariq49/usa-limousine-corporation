import { RoleKey, type Notification, type Prisma } from "@prisma/client";
import type { PrismaService } from "../../infrastructure/database/prisma.service";
import { RecipientType, type Client, type Create } from "../../modules/notification/types/notification";
import type { AdminNotify, CustomerNotify } from "../types/notification.types";

export type { AdminNotify, CustomerNotify };

export async function findAdminUserIds(
  prisma: Client | PrismaService,
  excludeUserId?: string | null,
): Promise<string[]> {
  const where: Prisma.UserWhereInput = {
    isActive: true,
    roles: { some: { role: { key: RoleKey.SUPER_ADMIN } } },
  };
  if (excludeUserId) {
    where.id = { not: excludeUserId };
  }

  const rows = await prisma.user.findMany({ where, select: { id: true } });
  return rows.map((row) => row.id);
}

export async function stageForAdmins(
  params: AdminNotify,
  client: Client,
): Promise<Notification[]> {
  const adminIds = await findAdminUserIds(client, params.excludeUserId);
  const inputs: Create[] = adminIds.map((id) => {
    const input: Create = {
      recipientType: RecipientType.USER,
      recipientId: id,
      type: params.type,
      title: params.title,
      body: params.body,
      push: false,
      idempotencyKey: `${params.idempotencyKey}:${id}`,
    };
    if (params.data !== undefined) {
      input.data = params.data;
    }
    return input;
  });
  return params.notificationService.stage(inputs, client);
}

export async function stageForCustomer(
  params: CustomerNotify,
  client: Client,
): Promise<Notification[]> {
  const where: Prisma.CustomerWhereUniqueInput | null = params.userId
    ? { userId: params.userId }
    : params.customerId
      ? { id: params.customerId }
      : null;
  if (!where) {
    return [];
  }
  const customer = await client.customer.findUnique({
    where,
    select: { userId: true, settings: { select: { notification: true } } },
  });
  if (!customer?.userId || customer.settings?.notification === false) {
    return [];
  }
  const input: Create = {
    recipientType: RecipientType.USER,
    recipientId: customer.userId,
    type: params.type,
    title: params.title,
    body: params.body,
    push: params.push !== false,
    idempotencyKey: params.idempotencyKey,
  };
  if (params.data !== undefined) {
    input.data = params.data;
  }
  return params.notificationService.stage([input], client);
}

export async function notifyForAdmins(
  params: AdminNotify,
  prisma: Client | PrismaService,
): Promise<Notification[]> {
  const adminIds = await findAdminUserIds(prisma, params.excludeUserId);
  const inputs: Create[] = adminIds.map((id) => {
    const input: Create = {
      recipientType: RecipientType.USER,
      recipientId: id,
      type: params.type,
      title: params.title,
      body: params.body,
      push: false,
      idempotencyKey: `${params.idempotencyKey}:${id}`,
    };
    if (params.data !== undefined) {
      input.data = params.data;
    }
    return input;
  });
  return params.notificationService.notifyMany(inputs);
}

export async function notifyCustomer(
  params: CustomerNotify,
  prisma: Client | PrismaService,
): Promise<Notification | null> {
  const where: Prisma.CustomerWhereUniqueInput | null = params.userId
    ? { userId: params.userId }
    : params.customerId
      ? { id: params.customerId }
      : null;
  if (!where) {
    return null;
  }
  const customer = await prisma.customer.findUnique({
    where,
    select: { userId: true, settings: { select: { notification: true } } },
  });
  if (!customer?.userId || customer.settings?.notification === false) {
    return null;
  }
  const input: Create = {
    recipientType: RecipientType.USER,
    recipientId: customer.userId,
    type: params.type,
    title: params.title,
    body: params.body,
    push: params.push !== false,
    idempotencyKey: params.idempotencyKey,
  };
  if (params.data !== undefined) {
    input.data = params.data;
  }
  return params.notificationService.notify(input);
}
