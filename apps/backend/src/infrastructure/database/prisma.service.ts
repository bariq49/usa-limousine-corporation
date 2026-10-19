import { Inject, Injectable, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { AppLogger } from "../../common/logger/app.logger";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject(AppLogger) private readonly logger: AppLogger) {
    super();
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      this.logger.error(
        "Database connection failed — verify DATABASE_URL in your environment file",
        error instanceof Error ? error.stack : undefined,
        PrismaService.name,
      );
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
