import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { WebsocketIdentity } from "../../../infrastructure/websocket/types/websocket.types";
import { DriverGeoService } from "../../driver/services/geo.service";
import { ACTIVE_TRIP_STATUSES, TRIP_LOCATION } from "../constants/trip.constants";
import type { CustomerLocation, Payload, Rooms } from "../types/location";
import { LocationHistoryService } from "./location-history.service";
import { LocationStoreService } from "./location-store.service";
import { TripRealtimeService } from "../websocket/trip-realtime.service";

@Injectable()
export class LocationService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(LocationStoreService) private readonly store: LocationStoreService,
    @Inject(LocationHistoryService) private readonly history: LocationHistoryService,
    @Inject(TripRealtimeService) private readonly realtime: TripRealtimeService,
    @Inject(DriverGeoService) private readonly geo: DriverGeoService,
  ) {}

  async publish(identity: WebsocketIdentity, raw: unknown): Promise<Payload> {
    if (!raw || typeof raw !== "object") {
      throw new ForbiddenException("Invalid location payload");
    }

    const body = raw as Record<string, unknown>;
    const tripId = typeof body["tripId"] === "string" ? body["tripId"].trim() : "";
    const lat = typeof body["lat"] === "number" ? body["lat"] : Number.NaN;
    const lng = typeof body["lng"] === "number" ? body["lng"] : Number.NaN;
    if (!tripId || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new ForbiddenException("tripId, lat, and lng are required");
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new ForbiddenException("Invalid coordinates");
    }

    const heading = body["heading"];
    const speed = body["speed"];
    const accuracy = body["accuracy"];
    const timestampRaw = body["timestamp"];
    if (heading !== undefined && (typeof heading !== "number" || !Number.isFinite(heading))) {
      throw new ForbiddenException("Invalid heading");
    }
    if (speed !== undefined && (typeof speed !== "number" || !Number.isFinite(speed))) {
      throw new ForbiddenException("Invalid speed");
    }
    if (
      accuracy !== undefined &&
      (typeof accuracy !== "number" || !Number.isFinite(accuracy) || accuracy < 0)
    ) {
      throw new ForbiddenException("Invalid accuracy");
    }
    if (
      timestampRaw !== undefined &&
      (typeof timestampRaw !== "number" || !Number.isFinite(timestampRaw))
    ) {
      throw new ForbiddenException("Invalid timestamp");
    }

    const driver = await this.prisma.driver.findFirst({
      where: { userId: identity.userId, deletedAt: null },
      select: { id: true },
    });
    if (!driver) {
      throw new ForbiddenException("Driver profile required");
    }

    const trip = await this.prisma.trip.findFirst({
      where: {
        id: tripId,
        driverId: driver.id,
        deletedAt: null,
        status: { in: ACTIVE_TRIP_STATUSES },
      },
      select: { id: true, driverId: true },
    });
    if (!trip) {
      throw new ForbiddenException("Active trip not found for this driver");
    }

    if (typeof accuracy === "number" && accuracy > TRIP_LOCATION.MAX_ACCURACY) {
      throw new ForbiddenException("Location accuracy too low");
    }

    const timestamp = typeof timestampRaw === "number" ? timestampRaw : Date.now();
    if (Math.abs(Date.now() - timestamp) > TRIP_LOCATION.MAX_AGE_MS) {
      throw new ForbiddenException("Location timestamp too old");
    }

    const allowed = await this.store.tryAcquireRate(driver.id);
    if (!allowed) {
      throw new ForbiddenException("Location updates too frequent");
    }

    const payload: Payload = {
      tripId: trip.id,
      driverId: trip.driverId,
      lat,
      lng,
      timestamp,
    };
    if (typeof heading === "number") {
      payload.heading = heading;
    }
    if (typeof speed === "number") {
      payload.speed = speed;
    }
    if (typeof accuracy === "number") {
      payload.accuracy = accuracy;
    }

    await this.store.save(payload);
    await this.history.append(payload);
    await this.geo.upsert({
      driverId: trip.driverId,
      lat: payload.lat,
      lng: payload.lng,
    });
    this.realtime.emit(payload);
    return payload;
  }

  async onStart(params: Rooms): Promise<void> {
    await this.realtime.join(params);
    await this.geo.markBusy({ driverId: params.driverId });
  }

  async onEnd(params: Rooms): Promise<void> {
    await this.history.flush(params.tripId);
    await this.realtime.leave(params);
    await this.store.clear(params.tripId, params.driverId);
    await this.geo.markFree({ driverId: params.driverId });
  }

  async latestForTrip(params: { tripId: string; driverId: string }): Promise<CustomerLocation> {
    const latest = await this.store.getByTrip(params.tripId);
    if (!latest) {
      return {
        tripId: params.tripId,
        driverId: params.driverId,
        lat: null,
        lng: null,
        heading: null,
        speed: null,
        accuracy: null,
        timestamp: null,
        stale: true,
      };
    }

    const ageMs = Date.now() - latest.timestamp;
    const stale = ageMs > TRIP_LOCATION.REDIS_TTL_SECONDS * 1000;

    return {
      tripId: latest.tripId,
      driverId: latest.driverId,
      lat: latest.lat,
      lng: latest.lng,
      heading: latest.heading ?? null,
      speed: latest.speed ?? null,
      accuracy: latest.accuracy ?? null,
      timestamp: latest.timestamp,
      stale,
    };
  }
}
