import { Inject, Injectable } from "@nestjs/common";
import { DriverRequestOutcome } from "@prisma/client";
import { DriverRequestEventRepository } from "../repositories/request-event.repository";
import type {
  AttachTrip,
  MarkClientCancelled,
  MarkDriverTripOutcome,
  MarkNotAccepted,
  MarkOutcome,
  RecordIncoming,
} from "../types/request-event";

@Injectable()
export class DriverRequestEventService {
  constructor(
    @Inject(DriverRequestEventRepository)
    private readonly events: DriverRequestEventRepository,
  ) {}

  async recordIncoming(params: RecordIncoming): Promise<void> {
    await this.events.recordIncoming(params);
  }

  async attachTrip(params: AttachTrip): Promise<void> {
    await this.events.attachTrip(params);
  }

  async markNotAccepted(params: MarkNotAccepted): Promise<void> {
    const payload: MarkOutcome = {
      bookingId: params.bookingId,
      outcome: DriverRequestOutcome.NOT_ACCEPTED,
    };
    if (params.driverId !== undefined) {
      payload.driverId = params.driverId;
    }
    if (params.excludeDriverId !== undefined) {
      payload.excludeDriverId = params.excludeDriverId;
    }
    await this.events.markOutcome(payload);
  }

  async markClientCancelled(params: MarkClientCancelled): Promise<void> {
    const payload: MarkOutcome = {
      bookingId: params.bookingId,
      outcome: DriverRequestOutcome.CLIENT_CANCELLED,
    };
    if (params.excludeDriverId !== undefined) {
      payload.excludeDriverId = params.excludeDriverId;
    }
    await this.events.markOutcome(payload);
  }

  async markFinished(params: MarkDriverTripOutcome): Promise<void> {
    await this.events.markDriverOutcome({
      bookingId: params.bookingId,
      driverId: params.driverId,
      tripId: params.tripId,
      outcome: DriverRequestOutcome.FINISHED,
    });
  }

  async markDriverCancelled(params: MarkDriverTripOutcome): Promise<void> {
    await this.events.markDriverOutcome({
      bookingId: params.bookingId,
      driverId: params.driverId,
      tripId: params.tripId,
      outcome: DriverRequestOutcome.DRIVER_CANCELLED,
    });
  }

  async markClientTripCancelled(params: MarkDriverTripOutcome): Promise<void> {
    await this.events.markDriverOutcome({
      bookingId: params.bookingId,
      driverId: params.driverId,
      tripId: params.tripId,
      outcome: DriverRequestOutcome.CLIENT_CANCELLED,
    });
  }

  async markClientNoShow(params: MarkDriverTripOutcome): Promise<void> {
    await this.events.markDriverOutcome({
      bookingId: params.bookingId,
      driverId: params.driverId,
      tripId: params.tripId,
      outcome: DriverRequestOutcome.CLIENT_NO_SHOW,
    });
  }
}
