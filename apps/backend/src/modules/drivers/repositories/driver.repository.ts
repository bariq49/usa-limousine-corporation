import { Inject, Injectable } from "@nestjs/common";
import {
  AssignmentStatus,
  BookingStatus,
  DriverStatus,
  type Prisma,
  RoleKey,
} from "@prisma/client";
import { APIFeature } from "../../../common/api-feature";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { CreateDto, DriverBookingsQueryDto, QueryDto, UpdateDto } from "../dto/driver.dto";

const driverInclude = {
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      avatar: true,
      createdAt: true,
    },
  },
  vehicleCategory: {
    select: { id: true, name: true, image: true, passengerCount: true },
  },
  _count: {
    select: { assignments: { where: { status: AssignmentStatus.ACTIVE } } },
  },
} as const;

const assignmentDriverInclude = {
  driver: {
    select: {
      id: true,
      status: true,
      user: {
        select: { firstName: true, lastName: true, email: true, phone: true, avatar: true },
      },
      vehicleCategory: { select: { id: true, name: true } },
    },
  },
} as const;

@Injectable()
export class DriverRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.driver.findFirst({
      where: { id, deletedAt: null },
      include: driverInclude,
    });
  }

  findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email }, select: { id: true } });
  }

  vehicleCategoryExists(id: string) {
    return this.prisma.vehicleCategory.count({ where: { id, deletedAt: null } });
  }

  findMany(query: QueryDto) {
    const feature = new APIFeature(query, {
      initialFilter: { deletedAt: null },
      filterFields: ["status", "vehicleCategoryId"],
      search: {
        searchFields: ["user.email", "user.firstName", "user.lastName", "user.phone"],
      },
      sort: {
        allowedFields: ["createdAt", "updatedAt", "status"],
        defaultSortBy: "createdAt",
        defaultSortOrder: "desc",
      },
      pagination: {
        defaultLimit: 20,
        maxLimit: 100,
      },
    });

    return feature.execute({
      findMany: (args) =>
        this.prisma.driver.findMany({
          where: args.where as Prisma.DriverWhereInput,
          orderBy: args.orderBy as Prisma.DriverOrderByWithRelationInput,
          skip: args.skip,
          take: args.take,
          include: driverInclude,
        }),
      count: ({ where }) => this.prisma.driver.count({ where: where as Prisma.DriverWhereInput }),
    });
  }

  create(data: CreateDto, passwordHash: string) {
    const status = data.status ?? DriverStatus.ACTIVE;
    return this.prisma.driver.create({
      data: {
        status,
        licenseNumber: data.licenseNumber || null,
        vehicleCategory: { connect: { id: data.vehicleCategoryId } },
        user: {
          create: {
            email: data.email,
            passwordHash,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            avatar: data.avatar || null,
            isActive: status === DriverStatus.ACTIVE,
            roles: { create: { role: { connect: { key: RoleKey.DRIVER } } } },
          },
        },
      },
      include: driverInclude,
    });
  }

  update(id: string, data: UpdateDto) {
    const user: Prisma.UserUpdateWithoutDriverInput = {};
    if (data.firstName !== undefined) user.firstName = data.firstName;
    if (data.lastName !== undefined) user.lastName = data.lastName;
    if (data.email !== undefined) user.email = data.email;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.avatar !== undefined) user.avatar = data.avatar || null;
    if (data.status !== undefined) user.isActive = data.status === DriverStatus.ACTIVE;

    const driver: Prisma.DriverUpdateInput = { user: { update: user } };
    if (data.status !== undefined) driver.status = data.status;
    if (data.licenseNumber !== undefined) driver.licenseNumber = data.licenseNumber || null;
    if (data.vehicleCategoryId !== undefined) {
      driver.vehicleCategory = { connect: { id: data.vehicleCategoryId } };
    }

    return this.prisma.driver.update({ where: { id }, data: driver, include: driverInclude });
  }

  countUpcomingAssignments(driverId: string) {
    return this.prisma.bookingAssignment.count({
      where: {
        driverId,
        status: AssignmentStatus.ACTIVE,
        booking: {
          deletedAt: null,
          status: { notIn: [BookingStatus.COMPLETED, BookingStatus.CANCELLED] },
        },
      },
    });
  }

  softDelete(id: string, userId: string) {
    return this.prisma.$transaction([
      this.prisma.driver.update({
        where: { id },
        data: { deletedAt: new Date(), status: DriverStatus.INACTIVE },
      }),
      this.prisma.user.update({ where: { id: userId }, data: { isActive: false } }),
      this.prisma.session.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  findBookings(driverId: string, query: DriverBookingsQueryDto) {
    const booking: Prisma.BookingWhereInput = { deletedAt: null };
    if (query.bookingStatus) booking.status = query.bookingStatus;

    const feature = new APIFeature(query, {
      initialFilter: { driverId, status: AssignmentStatus.ACTIVE, booking },
      filterFields: [],
      excludeQueryKeys: ["bookingStatus"],
      search: {
        searchFields: ["booking.bookingNumber"],
      },
      sort: {
        allowedFields: ["assignedAt"],
        defaultSortBy: "assignedAt",
        defaultSortOrder: "desc",
      },
      pagination: {
        defaultLimit: 10,
        maxLimit: 100,
      },
    });

    return feature.execute({
      findMany: (args) =>
        this.prisma.bookingAssignment.findMany({
          where: args.where as Prisma.BookingAssignmentWhereInput,
          orderBy: args.orderBy as Prisma.BookingAssignmentOrderByWithRelationInput,
          skip: args.skip,
          take: args.take,
          include: {
            booking: {
              select: {
                id: true,
                bookingNumber: true,
                status: true,
                bookingType: true,
                totalPrice: true,
                address: true,
                bookingTime: true,
                passenger: true,
              },
            },
          },
        }),
      count: ({ where }) =>
        this.prisma.bookingAssignment.count({
          where: where as Prisma.BookingAssignmentWhereInput,
        }),
    });
  }

  earningRows(driverId: string, start: string, end: string) {
    return this.prisma.bookingAssignment.findMany({
      where: {
        driverId,
        status: AssignmentStatus.ACTIVE,
        booking: {
          deletedAt: null,
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
          AND: [
            { bookingTime: { path: ["pickupDate"], gte: start } },
            { bookingTime: { path: ["pickupDate"], lt: end } },
          ],
        },
      },
      select: {
        driverAmount: true,
        commissionAmount: true,
        booking: { select: { bookingTime: true } },
      },
    });
  }

  findBookingForAssignment(bookingId: string) {
    return this.prisma.booking.findFirst({
      where: { id: bookingId, deletedAt: null },
      select: { id: true, bookingNumber: true, status: true, totalPrice: true },
    });
  }

  listAssignments(bookingId: string) {
    return this.prisma.bookingAssignment.findMany({
      where: { bookingId },
      orderBy: { assignedAt: "desc" },
      include: assignmentDriverInclude,
    });
  }

  assign(data: {
    bookingId: string;
    driverId: string;
    commissionRate: number;
    commissionAmount: number;
    driverAmount: number;
    note: string | null;
  }) {
    return this.prisma.$transaction(async (tx) => {
      await tx.bookingAssignment.updateMany({
        where: { bookingId: data.bookingId, status: AssignmentStatus.ACTIVE },
        data: { status: AssignmentStatus.SUPERSEDED },
      });
      return tx.bookingAssignment.create({
        data: {
          bookingId: data.bookingId,
          driverId: data.driverId,
          commissionRate: data.commissionRate,
          commissionAmount: data.commissionAmount,
          driverAmount: data.driverAmount,
          note: data.note,
        },
        include: assignmentDriverInclude,
      });
    });
  }

  unassign(bookingId: string) {
    return this.prisma.bookingAssignment.updateMany({
      where: { bookingId, status: AssignmentStatus.ACTIVE },
      data: { status: AssignmentStatus.UNASSIGNED },
    });
  }
}
