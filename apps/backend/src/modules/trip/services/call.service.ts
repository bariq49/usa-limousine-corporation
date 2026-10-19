import { ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { TripStatus } from "@prisma/client";
import type { Request } from "express";
import { requireUserId, toRequestContext } from "../../../common/utils/to-request-context";
import { AgoraService } from "../../../infrastructure/agora/agora.service";
import { requireDriver } from "../../driver/utils/require-driver";
import { DriverRepository } from "../../driver/repositories/driver.repository";
import { TripRepository } from "../repositories/trip.repository";
import type { CallTokenResult, IssueCallToken } from "../types/call";
import { agoraUidFromUserId, tripCallChannel } from "../utils/agora-uid";
import { TripRealtimeService } from "../websocket/trip-realtime.service";

const CALLABLE: TripStatus[] = [
  TripStatus.STARTED,
  TripStatus.ARRIVED_AT_PICKUP,
  TripStatus.PASSENGER_ON_BOARD,
  TripStatus.EN_ROUTE_TO_DROPOFF,
  TripStatus.ARRIVED_AT_DROPOFF,
];

@Injectable()
export class CallService {
  constructor(
    @Inject(TripRepository) private readonly trips: TripRepository,
    @Inject(DriverRepository) private readonly drivers: DriverRepository,
    @Inject(AgoraService) private readonly agora: AgoraService,
    @Inject(TripRealtimeService) private readonly realtime: TripRealtimeService,
  ) {}

  async tokenForDriver(tripId: string, request: Request): Promise<CallTokenResult> {
    const driver = await requireDriver(this.drivers, request);
    const trip = await this.trips.findByIdForDriver(tripId, driver.id);
    if (!trip) {
      throw new NotFoundException("Trip not found");
    }
    this.assertCallable(trip.status);

    const bookingUserId =
      trip.booking && "userId" in trip.booking
        ? ((trip.booking as { userId: string | null }).userId ?? null)
        : null;

    return this.issueToken({
      tripId: trip.id,
      userId: driver.userId,
      peerUserId: bookingUserId,
      driverId: driver.id,
    });
  }

  async tokenForCustomer(tripId: string, request: Request): Promise<CallTokenResult> {
    const userId = requireUserId(toRequestContext(request));
    const trip = await this.trips.findByIdForCustomer(tripId, userId);
    if (!trip) {
      throw new NotFoundException("Trip not found");
    }
    this.assertCallable(trip.status);

    const driver = await this.drivers.findById(trip.driverId);
    if (!driver) {
      throw new NotFoundException("Driver not found");
    }

    return this.issueToken({
      tripId: trip.id,
      userId,
      peerUserId: driver.userId,
      driverId: trip.driverId,
    });
  }

  assertCallable(status: TripStatus) {
    if (!CALLABLE.includes(status)) {
      throw new ForbiddenException(
        "Audio call is only available after the driver starts the ride (same window as chat)",
      );
    }
  }

  issueToken(params: IssueCallToken): CallTokenResult {
    const channel = tripCallChannel(params.tripId);
    const uid = agoraUidFromUserId(params.userId);
    const minted = this.agora.buildRtcToken({
      channel,
      uid,
      role: "publisher",
    });

    this.realtime.emitCallInvite({
      tripId: params.tripId,
      fromUserId: params.userId,
      peerUserId: params.peerUserId,
      driverId: params.driverId,
      channel,
    });

    return {
      tripId: params.tripId,
      appId: minted.appId,
      channel: minted.channel,
      uid: minted.uid,
      token: minted.token,
      role: "publisher",
      expiresAt: minted.expiresAt.toISOString(),
      mode: "audio",
    };
  }
}
