import type { RoleKey } from "@prisma/client";

export interface AssignRoles {
  userId: string;
  keys: RoleKey[];
}

export interface GetRoleKeysByUserId {
  userId: string;
}
