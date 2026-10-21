import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

export const SEQUENCE_ID = {
  BOOKING: "booking",
  HELP_TICKET: "help-ticket",
} as const;

@Injectable()
export class SequenceService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  /** Atomically increments the counter (row lock via upsert) and returns the new value. */
  async next(id: string) {
    const counter = await this.prisma.sequence.upsert({
      where: { id },
      create: { id, lastValue: 1 },
      update: { lastValue: { increment: 1 } },
    });

    return counter.lastValue;
  }

  nextBooking() {
    return this.next(SEQUENCE_ID.BOOKING);
  }

  nextHelpTicket() {
    return this.next(SEQUENCE_ID.HELP_TICKET);
  }
}
