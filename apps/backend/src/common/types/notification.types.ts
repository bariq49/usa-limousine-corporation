import type { NotificationType, Prisma } from "@prisma/client";

export type NotifyAdmins = {
  type: NotificationType;
  title: string;
  body: string;
  data?: Prisma.InputJsonValue;
  excludeUserId?: string | null;
  idempotencyKey: string;
};

export type NotifyUser = {
  userId?: string | null | undefined;
  type: NotificationType;
  title: string;
  body: string;
  data?: Prisma.InputJsonValue;
  idempotencyKey: string;
};
