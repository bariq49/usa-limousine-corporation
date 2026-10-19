import { Inject, Injectable } from "@nestjs/common";
import { type RoleKey } from "@prisma/client";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { GetRoleKeysByUserId } from "../types/role";

@Injectable()
export class RolesRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  upsert(params: { key: RoleKey; name: string }) {
    return this.prisma.role.upsert({
      where: { key: params.key },
      update: { name: params.name },
      create: params,
    });
  }

  findIdsByKeys(keys: RoleKey[]) {
    return this.prisma.role.findMany({
      where: { key: { in: keys } },
      select: { id: true },
    });
  }

  assignRoles(params: { userId: string; roleIds: string[] }) {
    const { userId, roleIds } = params;
    return this.prisma.userRole.createMany({
      data: roleIds.map((roleId) => ({ userId, roleId })),
      skipDuplicates: true,
    });
  }

  getRoleKeysByUserId(params: GetRoleKeysByUserId) {
    const { userId } = params;
    return this.prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });
  }
}
