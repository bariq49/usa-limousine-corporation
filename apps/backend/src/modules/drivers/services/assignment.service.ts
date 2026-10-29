import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { BookingStatus, DriverStatus } from "@prisma/client";
import type { Request } from "express";
import { PLATFORM } from "@usa-limousine-corporation/config";
import { AppLogger } from "../../../common/logger/app.logger";
import { auditLog } from "../../../common/utils/audit-log";
import { roundAmount, toAmount } from "../../../common/utils/money";
import { toRequestContext } from "../../../common/utils/to-request-context";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { EmailService } from "../../../infrastructure/email/email.service";
import { driverAssigned } from "../../../infrastructure/email/templates/booking/templates";
import { BookingRepository } from "../../booking/repositories/booking.repository";
import { toBookingEmail } from "../../booking/utils/booking-email-view";
import type { AssignDto } from "../dto/driver.dto";
import { DriverRepository } from "../repositories/driver.repository";

@Injectable()
export class AssignmentService {
  constructor(
    @Inject(DriverRepository) private readonly repository: DriverRepository,
    @Inject(BookingRepository) private readonly bookingRepository: BookingRepository,
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(EmailService) private readonly emailService: EmailService,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(AppLogger) private readonly logger: AppLogger,
  ) {}

  async list(bookingId: string) {
    await this.requireBooking(bookingId);
    return this.repository.listAssignments(bookingId);
  }

  async assign(bookingId: string, body: AssignDto, request: Request) {
    const context = toRequestContext(request);
    const booking = await this.requireBooking(bookingId);

    if (booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException(
        `A driver cannot be assigned to a ${booking.status.toLowerCase()} booking`,
      );
    }

    const driver = await this.repository.findById(body.driverId);
    if (!driver) {
      throw new NotFoundException("Driver not found");
    }
    if (driver.status !== DriverStatus.ACTIVE) {
      throw new BadRequestException("Only active drivers can be assigned to a booking");
    }

    const total = toAmount(booking.totalPrice);
    const commissionAmount = roundAmount((total * body.commissionRate) / 100);
    const assignment = await this.repository.assign({
      bookingId,
      driverId: driver.id,
      commissionRate: body.commissionRate,
      commissionAmount,
      driverAmount: roundAmount(total - commissionAmount),
      note: body.note || null,
    });

    await auditLog({
      prisma: this.prisma,
      event: "booking.driver_assigned",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        bookingId,
        bookingNumber: booking.bookingNumber,
        driverId: driver.id,
        assignmentId: assignment.id,
        commissionRate: body.commissionRate,
      },
    });
    void this.notifyDriver(bookingId, assignment.id);

    return assignment;
  }

  async unassign(bookingId: string, request: Request) {
    const context = toRequestContext(request);
    const booking = await this.requireBooking(bookingId);
    const result = await this.repository.unassign(bookingId);
    if (result.count === 0) {
      throw new BadRequestException("This booking has no assigned driver");
    }

    await auditLog({
      prisma: this.prisma,
      event: "booking.driver_unassigned",
      result: "success",
      context,
      userId: context.userId,
      metadata: { bookingId, bookingNumber: booking.bookingNumber },
    });

    return { message: "Driver unassigned", bookingId };
  }

  private async requireBooking(bookingId: string) {
    const booking = await this.repository.findBookingForAssignment(bookingId);
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }
    return booking;
  }

  private async notifyDriver(bookingId: string, assignmentId: string) {
    try {
      const row = await this.bookingRepository.findById(bookingId);
      const assignment = (await this.repository.listAssignments(bookingId)).find(
        (item) => item.id === assignmentId,
      );
      if (!row || !assignment) return;

      const user = assignment.driver.user;
      const driverName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Driver";
      await this.emailService.send({
        to: user.email,
        subject: `New ride assigned · ${row.bookingNumber} - ${PLATFORM.shortName}`,
        html: driverAssigned(
          toBookingEmail(row),
          {
            siteUrl: this.configService.getOrThrow<string>("WEBSITE_URL").replace(/\/+$/, ""),
            assetsUrl: `https://res.cloudinary.com/${this.configService.getOrThrow<string>("CLOUDINARY_CLOUD_NAME")}/image/upload/usa-limousine/email`,
          },
          {
            driverName,
            driverAmount: toAmount(assignment.driverAmount),
            note: assignment.note,
          },
        ),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(
        `Driver assignment email failed for ${bookingId}: ${message}`,
        undefined,
        AssignmentService.name,
      );
    }
  }
}
