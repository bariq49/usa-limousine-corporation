import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class SequenceService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async nextBooking() {
    const counter = await this.prisma.bookingSequence.upsert({
      where: { id: "global" },
      create: { id: "global", lastValue: 1 },
      update: { lastValue: { increment: 1 } },
    });

    return counter.lastValue;
  }

  async nextHelpTicket() {
    const counter = await this.prisma.helpTicketSequence.upsert({
      where: { id: "global" },
      create: { id: "global", lastValue: 1 },
      update: { lastValue: { increment: 1 } },
    });

    return counter.lastValue;
  }
}
