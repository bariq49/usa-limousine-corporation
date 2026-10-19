import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { Create } from "../types/customer";

@Injectable()
export class CustomerRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  create(params: Create) {
    return this.prisma.customer.create({
      data: {
        userId: params.userId,
        settings: { create: {} },
      },
    });
  }

  findByUserId(userId: string) {
    return this.prisma.customer.findFirst({
      where: { userId, deletedAt: null },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });
  }
}
