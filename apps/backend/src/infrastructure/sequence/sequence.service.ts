import { Inject, Injectable } from "@nestjs/common";
import { allocateCode } from "../../common/utils/allocate-sequence-code";
import { PrismaService } from "../database/prisma.service";

export type AllocateParams = {
  counterId: string;
  prefix: string;
  pad?: number;
};

@Injectable()
export class SequenceService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async next(counterId: string) {
    const counter = await this.prisma.driverApplicationSequence.upsert({
      where: { id: counterId },
      create: { id: counterId, lastValue: 1 },
      update: { lastValue: { increment: 1 } },
    });

    return counter.lastValue;
  }

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

  async nextPayout() {
    const counter = await this.prisma.payoutSequence.upsert({
      where: { id: "global" },
      create: { id: "global", lastValue: 1 },
      update: { lastValue: { increment: 1 } },
    });

    return counter.lastValue;
  }

  async allocate(params: AllocateParams) {
    if (params.pad !== undefined) {
      return allocateCode({
        prefix: params.prefix,
        nextSequence: () => this.next(params.counterId),
        pad: params.pad,
      });
    }

    return allocateCode({
      prefix: params.prefix,
      nextSequence: () => this.next(params.counterId),
    });
  }
}
