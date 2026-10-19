import type { RoleKey } from "@prisma/client";

export type CurrentUser = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  name?: string | null;
  email: string;
  phone: string | null;
  roles: RoleKey[];
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  memberSince: Date;
  sessionId: string;
  avatar: string | null;
};
