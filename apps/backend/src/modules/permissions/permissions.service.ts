import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";

@Injectable()
export class PermissionsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async userHasPermissions(userId: string, required: string[]): Promise<boolean> {
    if (required.length === 0) {
      return true;
    }

    const rolePermissions = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    const granted = new Set(
      rolePermissions.flatMap((row) =>
        row.role.permissions.map((permission) => permission.permission.key),
      ),
    );

    return required.every((permission) => granted.has(permission));
  }
}
