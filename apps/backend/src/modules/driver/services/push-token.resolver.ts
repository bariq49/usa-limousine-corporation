import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { TokenResolverRegistry } from "../../notification/services/push-token-resolver.registry";
import { RecipientType } from "../../notification/types/notification";
import type { TokenResolver } from "../../notification/types/push-token-resolver";

@Injectable()
export class DriverTokenResolver implements TokenResolver, OnModuleInit {
  readonly recipientType = RecipientType.DRIVER;

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(TokenResolverRegistry) private readonly registry: TokenResolverRegistry,
  ) {}

  onModuleInit() {
    this.registry.register(this);
  }

  async resolveToken(recipientId: string): Promise<string[]> {
    const map = await this.resolveTokens([recipientId]);
    return map.get(recipientId) ?? [];
  }

  async resolveTokens(recipientIds: string[]): Promise<Map<string, string[]>> {
    const tokens = new Map<string, string[]>();
    if (recipientIds.length === 0) {
      return tokens;
    }

    const drivers = await this.prisma.driver.findMany({
      where: {
        id: { in: recipientIds },
        deletedAt: null,
        OR: [{ settings: null }, { settings: { push: true } }],
      },
      select: {
        id: true,
        pushDevices: { select: { token: true } },
      },
    });

    for (const driver of drivers) {
      const list = driver.pushDevices.map((d) => d.token).filter(Boolean);
      if (list.length > 0) {
        tokens.set(driver.id, list);
      }
    }
    return tokens;
  }

  async invalidateTokens(tokens: string[]): Promise<number> {
    if (tokens.length === 0) {
      return 0;
    }

    const [devices, legacy] = await Promise.all([
      this.prisma.driverPushDevice.deleteMany({ where: { token: { in: tokens } } }),
      this.prisma.driver.updateMany({
        where: { fcmToken: { in: tokens } },
        data: { fcmToken: null },
      }),
    ]);
    return devices.count + legacy.count;
  }
}
