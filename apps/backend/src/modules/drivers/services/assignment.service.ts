import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus, DriverStatus } from "@prisma/client";
import type { Request } from "express";
import { AppLogger } from "../../../common/logger/app.logger";
import { auditLog } from "../../../common/utils/audit-log";
import { roundAmount, toAmount } from "../../../common/utils/money";
import { toRequestContext } from "../../../common/utils/to-request-context";
import { PrismaService } from "../../../infrastructure/database/prisma.service";

import { BookingRepository } from "../../booking/repositories/booking.repository";
import { BookingEmailService } from "../../booking/services/email.service";
import { DriverRepository } from "../repositories/driver.repository";
import type { AssignInput } from "../types/assignment";
import { DriverEmailService } from "./driver-email.service";
import { DriverSmsService } from "./driver-sms.service";

@Injectable()
export class AssignmentService {
  constructor(
    @Inject(DriverRepository) private readonly repository: DriverRepository,
    @Inject(BookingRepository) private readonly bookingRepository: BookingRepository,
    @Inject(BookingEmailService) private readonly bookingEmails: BookingEmailService,
    @Inject(DriverEmailService) private readonly driverEmails: DriverEmailService,
    @Inject(DriverSmsService) private readonly driverSms: DriverSmsService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AppLogger) private readonly logger: AppLogger,
  ) {}

  async list(bookingId: string) {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }
    return this.repository.listAssignments(bookingId);
  }

  async assign(input: AssignInput) {
    const { bookingId, body, request } = input;
    const context = toRequestContext(request);
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

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
    const user = assignment.driver.user;
    const driverName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Driver";
    const bookingEmail = this.bookingEmails.toBookingEmail(booking);
    const phone = user.phone?.trim();

    if (!phone) {
      this.logger.warn(
        `Driver assignment SMS skipped for ${bookingId}: driver phone is unavailable`,
        AssignmentService.name,
      );
    }

    void this.driverEmails.sendAssigned({
      to: user.email,
      booking: bookingEmail,
      assignment: {
        driverName,
        driverAmount: toAmount(assignment.driverAmount),
        note: assignment.note,
      },
    });

    if (phone) {
      void this.driverSms.sendAssigned({
        to: phone,
        bookingNumber: booking.bookingNumber,
        pickupDate: bookingEmail.pickupDate,
        pickupTime: bookingEmail.pickupTime,
        pickupAddress: bookingEmail.pickupAddress,
      });
    }

    return assignment;
  }

  async unassign(bookingId: string, request: Request) {
    const context = toRequestContext(request);
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }
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
}
