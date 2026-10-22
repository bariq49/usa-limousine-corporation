import { Inject, Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { APIFeature } from "../../../common/api-feature";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { AdminCustomerQueryDto } from "../dto/admin-customer.dto";
import type { Create } from "../types/customer";

/** Account fields admins may see (never the password hash or lockout internals). */
const userSummary = {
  select: {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    avatar: true,
    isEmailVerified: true,
    isActive: true,
    createdAt: true,
    _count: { select: { bookings: true } },
  },
} as const;

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

  /** Admin list: search by name/email/phone, filter by tier. */
  findMany(query: AdminCustomerQueryDto) {
    const initialFilter: Prisma.CustomerWhereInput = { deletedAt: null };

    const feature = new APIFeature(query, {
      initialFilter,
      filterFields: ["type"],
      search: {
        searchFields: ["user.email", "user.firstName", "user.lastName", "user.phone"],
      },
      sort: {
        allowedFields: ["createdAt", "updatedAt", "type"],
        defaultSortBy: "createdAt",
        defaultSortOrder: "desc",
      },
      pagination: {
        defaultLimit: 20,
        maxLimit: 100,
      },
      dateRange: {
        field: "createdAt",
      },
    });

    return feature.execute({
      findMany: (args) =>
        this.prisma.customer.findMany({
          where: args.where as never,
          orderBy: args.orderBy as never,
          skip: args.skip,
          take: args.take,
          include: {
            user: userSummary,
            _count: { select: { helpTickets: true } },
          },
        }),
      count: ({ where }) => this.prisma.customer.count({ where: where as never }),
    });
  }

  /** Admin detail with settings and the latest bookings and tickets. */
  findById(id: string) {
    return this.prisma.customer.findFirst({
      where: { id, deletedAt: null },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
            isEmailVerified: true,
            isActive: true,
            createdAt: true,
            _count: { select: { bookings: true } },
            bookings: {
              where: { deletedAt: null },
              orderBy: { createdAt: "desc" },
              take: 10,
              select: {
                id: true,
                bookingNumber: true,
                status: true,
                bookingType: true,
                totalPrice: true,
                currency: true,
                createdAt: true,
              },
            },
          },
        },
        settings: { select: { email: true, notification: true } },
        _count: { select: { helpTickets: true } },
        helpTickets: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            ticketNumber: true,
            subject: true,
            status: true,
            category: true,
            createdAt: true,
          },
        },
      },
    });
  }
}
