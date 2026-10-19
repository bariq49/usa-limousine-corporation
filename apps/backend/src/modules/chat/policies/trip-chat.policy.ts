import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { ConversationSubjectType, TripStatus } from "@prisma/client";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { AssertCanSend, SubjectPolicy } from "../types/chat";

const SENDABLE: TripStatus[] = [
  TripStatus.STARTED,
  TripStatus.ARRIVED_AT_PICKUP,
  TripStatus.PASSENGER_ON_BOARD,
  TripStatus.EN_ROUTE_TO_DROPOFF,
  TripStatus.ARRIVED_AT_DROPOFF,
];

@Injectable()
export class TripChatPolicy implements SubjectPolicy {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async assertCanSend(props: AssertCanSend): Promise<void> {
    if (props.subjectType !== ConversationSubjectType.TRIP) {
      throw new ForbiddenException("Unsupported conversation subject");
    }

    const trip = await this.prisma.trip.findFirst({
      where: { id: props.subjectId, deletedAt: null },
      select: {
        status: true,
        driver: { select: { userId: true } },
        booking: { select: { userId: true } },
      },
    });

    if (!trip) {
      throw new ForbiddenException("Trip not found for conversation");
    }

    const isDriver = trip.driver.userId === props.userId;
    const isCustomer = trip.booking.userId === props.userId;
    if (!isDriver && !isCustomer) {
      throw new ForbiddenException("Not a participant of this trip chat");
    }

    if (!SENDABLE.includes(trip.status)) {
      throw new ForbiddenException("Chat is not open for this trip status");
    }
  }

  async resolveParticipantUserIds(tripId: string): Promise<string[]> {
    const trip = await this.prisma.trip.findFirst({
      where: { id: tripId, deletedAt: null },
      select: {
        driver: { select: { userId: true } },
        booking: { select: { userId: true } },
      },
    });
    if (!trip) {
      return [];
    }
    const ids: string[] = [trip.driver.userId];
    if (trip.booking.userId) {
      ids.push(trip.booking.userId);
    }
    return Array.from(new Set(ids));
  }
}
