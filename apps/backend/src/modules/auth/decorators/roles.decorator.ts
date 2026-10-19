import { SetMetadata } from "@nestjs/common";
import type { RoleKey } from "@prisma/client";
import { ROLES_KEY } from "../constants/auth.constants";

export const Roles = (...roles: RoleKey[]) => SetMetadata(ROLES_KEY, roles);
