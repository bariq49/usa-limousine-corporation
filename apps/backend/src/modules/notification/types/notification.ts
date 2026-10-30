import type { Notification } from "@prisma/client";
import {
  NotificationRecipientType as RecipientType,
  type NotificationType,
  type Prisma,
} from "@prisma/client";

export { RecipientType };

export type Create = {
  recipientType: RecipientType;
  recipientId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Prisma.InputJsonValue;
  push?: boolean;
  idempotencyKey?: string;
};

export type Client = Prisma.TransactionClient;

export type CursorPage = {
  items: Notification[];
  nextCursor: string | null;
  hasNextPage: boolean;
};

export type ReadEvent = Recipient & {
  ids: string[] | null;
};

export type RemovedEvent = Recipient & {
  ids: string[];
};

export type CreateMany = {
  inputs: Create[];
};

export type Query = {
  cursor?: string;
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  sort?: string;
  q?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  type?: NotificationType;
};

export type Recipient = {
  recipientType: RecipientType;
  recipientId: string;
};

export type MarkRead = Recipient & {
  id: string;
};

export type Id = {
  id: string;
};

export type Remove = Recipient & {
  id: string;
};

export type RemoveMany = Recipient & {
  ids: string[];
};

export type FcmData = Record<string, string>;

export type FcmSource = {
  type: string;
  title: string;
  body: string;
  data?: Prisma.InputJsonValue | Prisma.JsonValue | null;
  id?: string;
};

export type Deliver = {
  notification: Notification;
};

export type DeliverMany = {
  notifications: Notification[];
};

export type Push = {
  tokens: string[];
  title: string;
  body: string;
  data: FcmData;
  attempt?: number;
};

export type PushResult = {
  retryTokens: string[];
};
