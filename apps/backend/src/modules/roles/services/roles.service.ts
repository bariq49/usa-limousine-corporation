import { Inject, Injectable } from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import { RolesRepository } from "../repositories/roles.repository";
import type { AssignRoles, GetRoleKeysByUserId } from "../types/role";

@Injectable()
export class RolesService {
  constructor(@Inject(RolesRepository) private readonly rolesRepository: RolesRepository) {}

  async ensureDefaults() {
    const defaults: Array<{ key: RoleKey; name: string }> = [
      { key: RoleKey.SUPER_ADMIN, name: "Super Admin" },
      { key: RoleKey.CUSTOMER, name: "Customer" },
      { key: RoleKey.BUSINESS_CUSTOMER, name: "Business Customer" },
      { key: RoleKey.VIP_CUSTOMER, name: "VIP Customer" },
    ];

    await Promise.all(defaults.map((role) => this.rolesRepository.upsert(role)));
  }

  async assignRoles(params: AssignRoles) {
    const roles = await this.rolesRepository.findIdsByKeys(params.keys);
    await this.rolesRepository.assignRoles({
      userId: params.userId,
      roleIds: roles.map((role) => role.id),
    });
  }

  async getRoleKeysByUserId(params: GetRoleKeysByUserId) {
    const rows = await this.rolesRepository.getRoleKeysByUserId(params);
    return rows.map((row) => row.role.key);
  }
}
