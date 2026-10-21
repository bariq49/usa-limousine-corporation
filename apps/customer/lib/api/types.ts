import type { NotificationItem } from "@usa-limousine-corporation/ui/providers/notification-context";
import type { RoleKey } from "@usa-limousine-corporation/ui/types/navigation";

export type AuthTokens = {
  accessToken: string;
  sessionId: string;
};

export type CsrfResponse = {
  csrfToken: string;
};

export type CurrentUserMembership = {
  id: string;
  membershipStatus: string;
  organization: {
    id: string;
    name: string;
    slug: string;
    status: string;
  };
};

export type CurrentUser = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  roles: RoleKey[];
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  memberSince?: string;
  sessionId: string;
  memberships: CurrentUserMembership[];
};

export type MessageResponse = {
  message: string;
};

export type UploadResponse = {
  publicId: string;
  url: string;
  secureUrl: string;
  resourceType: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
};

export type UploadFileOptions = {
  file: File;
  folder?: string;
};

export type SessionApiItem = {
  id: string;
  deviceId: string;
  ipAddress: string | null;
  userAgent: string | null;
  expiresAt: string;
  revokedAt?: string | null;
  lastSeenAt: string;
  createdAt: string;
};

export type NotificationList = {
  items: NotificationItem[];
  /** Pass as `cursor` to load the next page; null on the last page. */
  nextCursor: string | null;
  hasNextPage: boolean;
  unreadCount: number;
};
