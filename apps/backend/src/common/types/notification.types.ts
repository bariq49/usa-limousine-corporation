import type { NotificationType, Prisma } from "@prisma/client";
import type { NotificationService } from "../../modules/notification/services/notification.service";

export type AdminNotify = {
  notificationService: NotificationService;
  type: NotificationType;
  title: string;
  body: string;
  data?: Prisma.InputJsonValue | undefined;
  excludeUserId?: string | null | undefined;
  idempotencyKey: string;
};

export type CustomerNotify = {
  notificationService: NotificationService;
  userId?: string | null | undefined;
  customerId?: string | null | undefined;
  type: NotificationType;
  title: string;
  body: string;
  data?: Prisma.InputJsonValue | undefined;
  push?: boolean | undefined;
  idempotencyKey: string;
};
