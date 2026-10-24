import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { UpdateDto } from "../dto/update.dto";

/** Id of the single settings row. */
const SETTINGS_ID = "global";

@Injectable()
export class PlatformSettingsRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  /** The settings row, created with defaults on first read. */
  get() {
    return this.prisma.platformSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID },
      update: {},
    });
  }

  async update(data: UpdateDto) {
    await this.get();
    return this.prisma.platformSettings.update({ where: { id: SETTINGS_ID }, data });
  }
}
