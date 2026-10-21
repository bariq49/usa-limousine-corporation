import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { TokenResolverRegistry } from "../../notification/services/push-token-resolver.registry";
import { RecipientType } from "../../notification/types/notification";
import type { TokenResolver } from "../../notification/types/push-token-resolver";

@Injectable()
export class CustomerTokenResolver implements TokenResolver, OnModuleInit {
  readonly recipientType = RecipientType.USER;

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

    const customers = await this.prisma.customer.findMany({
      where: {
        userId: { in: recipientIds },
        deletedAt: null,
      },
      select: {
        userId: true,
        pushDevices: { select: { token: true } },
      },
    });

    for (const customer of customers) {
      const list = customer.pushDevices.map((d) => d.token).filter(Boolean);
      if (list.length > 0) {
        tokens.set(customer.userId, list);
      }
    }
    return tokens;
  }

  async invalidateTokens(tokens: string[]): Promise<number> {
    if (tokens.length === 0) {
      return 0;
    }

    const devices = await this.prisma.customerPushDevice.deleteMany({
      where: { token: { in: tokens } },
    });
    return devices.count;
  }
}
