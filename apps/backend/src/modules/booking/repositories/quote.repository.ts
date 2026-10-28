import { Inject, Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../../../infrastructure/database/prisma.service";

@Injectable()
export class QuoteRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  create(data: Prisma.QuoteUncheckedCreateInput) {
    return this.prisma.quote.create({ data });
  }

  findById(id: string) {
    return this.prisma.quote.findUnique({ where: { id } });
  }

  deleteUnused(before: Date) {
    return this.prisma.quote.deleteMany({
      where: { expiresAt: { lt: before }, booking: { is: null } },
    });
  }
}
