import { Inject, Injectable } from "@nestjs/common";
import { type CalendarOwnerType, Prisma } from "@prisma/client";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { APP_TIMEZONE } from "../../../common/utils/format-time";
import type { CreateData, UpdateData } from "../types/calendar";

@Injectable()
export class CalendarRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  create(data: CreateData) {
    return this.prisma.calendarEvent.create({
      data: {
        ownerType: data.ownerType,
        ownerId: data.ownerId,
        bookingId: data.bookingId ?? null,
        bookingType: data.bookingType ?? null,
        type: data.type,
        title: data.title,
        description: data.description ?? null,
        startAt: data.startAt,
        endAt: data.endAt,
        timezone: data.timezone ?? APP_TIMEZONE,
        metadata: data.metadata ?? Prisma.JsonNull,
      },
    });
  }

  findById(id: string) {
    return this.prisma.calendarEvent.findFirst({
      where: { id, deletedAt: null },
    });
  }

  findByOwner(ownerType: CalendarOwnerType, ownerId: string) {
    return this.prisma.calendarEvent.findMany({
      where: { ownerType, ownerId, deletedAt: null },
      orderBy: { startAt: "asc" },
    });
  }

  findByBookingId(bookingId: string) {
    return this.prisma.calendarEvent.findFirst({
      where: { bookingId, deletedAt: null },
    });
  }

  update(id: string, data: UpdateData) {
    const payload: Record<string, unknown> = {};
    if (data.status !== undefined) payload["status"] = data.status;
    if (data.title !== undefined) payload["title"] = data.title;
    if (data.description !== undefined) payload["description"] = data.description;
    if (data.startAt !== undefined) payload["startAt"] = data.startAt;
    if (data.endAt !== undefined) payload["endAt"] = data.endAt;
    if (data.metadata !== undefined) payload["metadata"] = data.metadata;
    if (data.deletedAt !== undefined) payload["deletedAt"] = data.deletedAt;
    return this.prisma.calendarEvent.update({
      where: { id },
      data: payload as never,
    });
  }

  softDelete(id: string) {
    return this.prisma.calendarEvent.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
