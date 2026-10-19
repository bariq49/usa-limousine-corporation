import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/database/prisma.service";

@Injectable()
export class DriverRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findByUserId(userId: string) {
    const row = await this.prisma.driver.findFirst({
      where: { userId, deletedAt: null },
      select: { id: true },
    });
    if (!row) {
      return null;
    }
    return this.findById(row.id);
  }

  findById(id: string) {
    return this.prisma.driver.findFirst({
      where: { id, deletedAt: null },
      include: {
        user: { select: { id: true, email: true } },
        vehicle: {
          include: {
            vehicleCategory: {
              include: {
                luggageCapacity: true,
              },
            },
            luggageCapacity: {
              include: { luggageType: true },
              orderBy: { luggageType: { name: "asc" } },
            },
          },
        },
        documents: {
          where: { deletedAt: null },
          orderBy: { uploadedAt: "desc" },
        },
        languages: {
          orderBy: { code: "asc" },
        },
      },
    });
  }

  countCompletedTrips(driverId: string) {
    return this.prisma.trip.count({
      where: {
        driverId,
        status: "COMPLETED",
      },
    });
  }

  listReviews(driverId: string) {
    return this.prisma.driverReview.findMany({
      where: { driverId },
      orderBy: { createdAt: "desc" },
      include: {
        customer: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        trip: {
          select: {
            id: true,
            booking: {
              select: {
                address: true,
                passenger: true,
              },
            },
          },
        },
      },
    });
  }
}
