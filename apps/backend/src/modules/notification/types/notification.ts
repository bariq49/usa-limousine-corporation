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
  idempotencyKey?: string;
};

export type Client = Prisma.TransactionClient;

export type CursorPage = {
  items: Item[];
  nextCursor: string | null;
  hasNextPage: boolean;
};

export type Item = Pick<
  Notification,
  "id" | "type" | "title" | "body" | "data" | "readAt" | "createdAt"
>;

export type Owned = Item;

export type ReadEvent = Recipient & {
  ids: string[] | null;
};

export type RemovedEvent = Recipient & {
  ids: string[];
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

export type DeliveryClaim = {
  now: Date;
  lockUntil: Date;
  take: number;
} & (
  | {
      ids: string[];
      createdBefore?: never;
    }
  | {
      ids?: never;
      createdBefore: Date;
    }
);

export type DeliveryStatus = {
  pending: number;
  retryScheduled: number;
  inProgress: number;
  deadLettered: number;
};

export type DeliveryResult = {
  claimed: number;
  delivered: number;
  failed: number;
  deadLettered: number;
};

export type DeadLetterQuery = {
  cursor?: string;
  limit?: number;
};

export type DeadLetter = {
  id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  body: string;
  deliveryAttempts: number;
  deadLetteredAt: Date | null;
  lastDeliveryError: string | null;
  createdAt: Date;
};

export type DeadLetterPage = {
  items: DeadLetter[];
  nextCursor: string | null;
  hasNextPage: boolean;
};
