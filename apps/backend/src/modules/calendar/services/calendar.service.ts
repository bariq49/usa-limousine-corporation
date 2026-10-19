import { Injectable } from "@nestjs/common";
import { type CalendarOwnerType } from "@prisma/client";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { CalendarRepository } from "../repositories/calendar.repository";
import type { CreateData, UpdateData } from "../types/calendar";

@Injectable()
export class CalendarService {
  constructor(private readonly calendarRepository: CalendarRepository) {}

  create(data: CreateData) {
    return this.calendarRepository.create(data);
  }

  getByOwner(ownerType: CalendarOwnerType, ownerId: string) {
    return this.calendarRepository.findByOwner(ownerType, ownerId);
  }

  getById(id: string) {
    return this.calendarRepository.findById(id);
  }

  getByReferenceId(bookingId: string) {
    return this.calendarRepository.findByBookingId(bookingId);
  }

  update(id: string, data: UpdateData) {
    return this.calendarRepository.update(id, data);
  }

  delete(id: string) {
    return this.calendarRepository.softDelete(id);
  }
}
