import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import * as argon2 from "argon2";
import { randomBytes } from "node:crypto";
import type { Request } from "express";
import { auditLog } from "../../../common/utils/audit-log";
import { bucketIndex, periodBuckets } from "../../../common/utils/period-buckets";
import { roundAmount, toAmount } from "../../../common/utils/money";
import { toRequestContext } from "../../../common/utils/to-request-context";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { TimeInput } from "../../booking/types/booking";
import type {
  CreateDto,
  DriverBookingsQueryDto,
  QueryDto,
  StatsQueryDto,
  UpdateDto,
} from "../dto/driver.dto";
import { DriverRepository } from "../repositories/driver.repository";
import type { DriverStats } from "../types/driver";

@Injectable()
export class DriverService {
  constructor(
    @Inject(DriverRepository) private readonly repository: DriverRepository,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  list(query: QueryDto) {
    return this.repository.findMany(query);
  }

  async getOne(id: string) {
    const driver = await this.repository.findById(id);
    if (!driver) {
      throw new NotFoundException("Driver not found");
    }
    return driver;
  }

  async create(body: CreateDto, request: Request) {
    const context = toRequestContext(request);
    await this.assertEmailAvailable(body.email);
    await this.assertVehicleCategory(body.vehicleCategoryId);

    const passwordHash = await argon2.hash(randomBytes(32).toString("hex"));
    const driver = await this.repository.create(body, passwordHash);

    await auditLog({
      prisma: this.prisma,
      event: "driver.created",
      result: "success",
      context,
      userId: context.userId,
      metadata: { driverId: driver.id, email: driver.user.email },
    });

    return driver;
  }

  async update(id: string, body: UpdateDto, request: Request) {
    const context = toRequestContext(request);
    const existing = await this.getOne(id);

    if (body.email !== undefined && body.email !== existing.user.email) {
      await this.assertEmailAvailable(body.email);
    }
    if (body.vehicleCategoryId !== undefined) {
      await this.assertVehicleCategory(body.vehicleCategoryId);
    }

    const driver = await this.repository.update(id, body);

    await auditLog({
      prisma: this.prisma,
      event: "driver.updated",
      result: "success",
      context,
      userId: context.userId,
      metadata: { driverId: driver.id },
    });

    return driver;
  }

  async remove(id: string, request: Request) {
    const context = toRequestContext(request);
    const driver = await this.getOne(id);

    if ((await this.repository.countUpcomingAssignments(id)) > 0) {
      throw new ConflictException(
        "This driver has upcoming rides. Reassign or unassign them before deleting the driver.",
      );
    }

    await this.repository.softDelete(id, driver.user.id);

    await auditLog({
      prisma: this.prisma,
      event: "driver.deleted",
      result: "success",
      context,
      userId: context.userId,
      metadata: { driverId: id },
    });

    return { message: "Driver deleted", id };
  }

  async bookings(id: string, query: DriverBookingsQueryDto) {
    await this.getOne(id);
    return this.repository.findBookings(id, query);
  }

  async stats(id: string, query: StatsQueryDto): Promise<DriverStats> {
    await this.getOne(id);
    const buckets = periodBuckets(query.period);
    const first = buckets[0];
    const last = buckets[buckets.length - 1];
    if (!first || !last) {
      throw new BadRequestException("Unsupported period");
    }

    const rows = await this.repository.earningRows(id, first.start, last.end);
    const rides = buckets.map(() => 0);
    const earnings = buckets.map(() => 0);
    const commission = buckets.map(() => 0);

    for (const row of rows) {
      const pickupDate = (row.booking.bookingTime as TimeInput).pickupDate;
      const index = bucketIndex(buckets, pickupDate);
      if (index < 0) continue;
      rides[index] = (rides[index] ?? 0) + 1;
      earnings[index] = roundAmount((earnings[index] ?? 0) + toAmount(row.driverAmount));
      commission[index] = roundAmount((commission[index] ?? 0) + toAmount(row.commissionAmount));
    }

    return {
      period: query.period,
      labels: buckets.map((bucket) => bucket.label),
      totalRides: rides.reduce((sum, value) => sum + value, 0),
      totalEarnings: roundAmount(earnings.reduce((sum, value) => sum + value, 0)),
      totalCommission: roundAmount(commission.reduce((sum, value) => sum + value, 0)),
      rides,
      earnings,
      commission,
    };
  }

  private async assertEmailAvailable(email: string) {
    if (await this.repository.findUserByEmail(email)) {
      throw new ConflictException("An account with this email already exists");
    }
  }

  private async assertVehicleCategory(id: string) {
    if ((await this.repository.vehicleCategoryExists(id)) === 0) {
      throw new BadRequestException("Vehicle category not found");
    }
  }
}
