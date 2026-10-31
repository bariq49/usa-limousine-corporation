import { RoleKey, type Notification, type Prisma } from "@prisma/client";
import type { PrismaService } from "../../infrastructure/database/prisma.service";
import {
  RecipientType,
  type Client,
  type Create,
} from "../../modules/notification/types/notification";
import type { NotificationService } from "../../modules/notification/services/notification.service";
import type { NotifyAdmins, NotifyUser } from "../types/notification.types";

async function findAdminUserIds(
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
  notificationService: NotificationService,
  params: NotifyAdmins,
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
      idempotencyKey: `${params.idempotencyKey}:${id}`,
    };
    if (params.data !== undefined) {
      input.data = params.data;
    }
    return input;
  });
  return notificationService.stage(inputs, client);
}

export async function stageForUser(
  notificationService: NotificationService,
  params: NotifyUser,
  client: Client,
): Promise<Notification[]> {
  if (!params.userId) {
    return [];
  }
  const input: Create = {
    recipientType: RecipientType.USER,
    recipientId: params.userId,
    type: params.type,
    title: params.title,
    body: params.body,
    idempotencyKey: params.idempotencyKey,
  };
  if (params.data !== undefined) {
    input.data = params.data;
  }
  return notificationService.stage([input], client);
}

export async function notifyForAdmins(
  notificationService: NotificationService,
  params: NotifyAdmins,
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
      idempotencyKey: `${params.idempotencyKey}:${id}`,
    };
    if (params.data !== undefined) {
      input.data = params.data;
    }
    return input;
  });
  return notificationService.notifyMany(inputs);
}

export async function notifyUser(
  notificationService: NotificationService,
  params: NotifyUser,
): Promise<Notification | null> {
  if (!params.userId) {
    return null;
  }
  const input: Create = {
    recipientType: RecipientType.USER,
    recipientId: params.userId,
    type: params.type,
    title: params.title,
    body: params.body,
    idempotencyKey: params.idempotencyKey,
  };
  if (params.data !== undefined) {
    input.data = params.data;
  }
  return notificationService.notify(input);
}
