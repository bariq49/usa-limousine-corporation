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

/** One notification fanned out to every active super admin. */
export type NotifyAdmins = {
  type: NotificationType;
  title: string;
  body: string;
  data: Prisma.InputJsonValue;
  /** Skip the admin who caused the event. */
  excludeUserId?: string | null;
  /** Per-admin keys are `${idempotencyKey}:${adminId}`, so a replayed event never duplicates. */
  idempotencyKey: string;
};

/** Prisma client for the caller's transaction, or the root client. */
export type Client = Prisma.TransactionClient;

export type CursorPage = {
  items: Notification[];
  nextCursor: string | null;
  hasNextPage: boolean;
};

export type ReadEvent = Recipient & {
  /** Null means every notification of the recipient was marked read. */
  ids: string[] | null;
};

export type RemovedEvent = Recipient & {
  ids: string[];
};

export type CreateMany = {
  inputs: Create[];
};

export type Query = {
  /** Keyset pagination: pass "" for the first page, then the previous `nextCursor`. */
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
  /** 1 on the first send; transient token failures are re-queued with attempt + 1. */
  attempt?: number;
};

export type PushResult = {
  /** Tokens that failed with a transient FCM error and are worth retrying. */
  retryTokens: string[];
};
