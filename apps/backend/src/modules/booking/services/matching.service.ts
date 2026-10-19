import { Inject, Injectable } from "@nestjs/common";
import { BookingStatus } from "@prisma/client";
import { AppLogger } from "../../../common/logger/app.logger";
import { DriverGeoService } from "../../driver/services/geo.service";
import { DriverRequestEventService } from "../../driver/services/request-event.service";
import { SettingsRepository } from "../../settings/repositories/settings.repository";
import { BookingRepository } from "../repositories/booking.repository";
import { OfferRepository } from "../repositories/offer.repository";
import { OfferCacheService } from "./offer-cache.service";
import { OfferMetricsService } from "./offer-metrics.service";
import { OfferRealtimeService } from "./offer-realtime.service";

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

@Injectable()
export class MatchingService {
  constructor(
    @Inject(BookingRepository) private readonly bookings: BookingRepository,
    @Inject(OfferRepository) private readonly offers: OfferRepository,
    @Inject(DriverGeoService) private readonly geo: DriverGeoService,
    @Inject(OfferCacheService) private readonly cache: OfferCacheService,
    @Inject(OfferRealtimeService) private readonly realtime: OfferRealtimeService,
    @Inject(AppLogger) private readonly logger: AppLogger,
    @Inject(OfferMetricsService) private readonly metrics: OfferMetricsService,
    @Inject(SettingsRepository) private readonly settings: SettingsRepository,
    @Inject(DriverRequestEventService) private readonly requestEvents: DriverRequestEventService,
  ) {}

  async dispatch(bookingId: string, radius?: number): Promise<string[]> {
    const started = Date.now();
    const offerCfg = await this.settings.getOfferMarketplace();
    const matchRadius = radius ?? offerCfg.radius;

    const booking = await this.bookings.findById(bookingId);
    if (!booking || booking.status !== BookingStatus.SEEKING_OFFERS) {
      return [];
    }

    const address = booking.address as {
      pickup?: { latitude?: number; longitude?: number };
    };
    const lat = address.pickup?.latitude;
    const lng = address.pickup?.longitude;
    if (typeof lat !== "number" || typeof lng !== "number") {
      this.logger.warn(
        `Matching skipped for booking ${bookingId}: missing pickup coordinates`,
        MatchingService.name,
      );
      return [];
    }

    let nearby = await this.geo.searchNearby({
      lat,
      lng,
      radius: matchRadius,
      categoryId: booking.vehicleCategoryId,
      count: offerCfg.geoMatchCount,
    });

    if (nearby.length === 0) {
      nearby = await this.fallbackHaversine(
        booking.vehicleCategoryId,
        lat,
        lng,
        matchRadius,
        offerCfg.geoMatchCount,
      );
    }

    const freeIds = await this.geo.filterBusy({
      driverIds: nearby.map((n) => n.driverId),
    });
    const freeSet = new Set(freeIds);
    nearby = nearby.filter((n) => freeSet.has(n.driverId));

    const drivers = await this.offers.findDriversByIds(nearby.map((n) => n.driverId));
    const matched = drivers.filter(
      (d) =>
        d.vehicle &&
        !d.vehicle.deletedAt &&
        d.vehicle.vehicleCategoryId === booking.vehicleCategoryId,
    );

    const matchedIds = matched.map((d) => d.id);
    if (matchedIds.length === 0) {
      return [];
    }

    const ttlSeconds = offerCfg.sessionTtlMin * 60;
    await this.cache.trackDrivers({ bookingId, driverIds: matchedIds, ttlSeconds });
    await this.requestEvents.recordIncoming({ bookingId, driverIds: matchedIds });

    const pricing = booking.pricing as { total?: number };
    const payload = {
      type: "OFFER_REQUEST",
      payload: {
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
        vehicleCategoryId: booking.vehicleCategoryId,
        fairPrice: pricing.total ?? 0,
        address: booking.address,
        bookingTime: booking.bookingTime,
        passenger: {
          passengerCount: (booking.passenger as { passengerCount?: number })?.passengerCount,
        },
        offerSessionExpiresAt: booking.offerSessionExpiresAt?.toISOString() ?? null,
        matchingRadius: matchRadius,
      },
    };

    this.realtime.requestToDrivers(matchedIds, payload);

    await this.bookings.updateMatchingRadius(bookingId, matchRadius);
    await this.metrics.incr("match_dispatched");
    await this.metrics.incr("match_candidates", matchedIds.length);
    await this.metrics.timing("match_ms", Date.now() - started);
    return matchedIds;
  }

  private async fallbackHaversine(
    vehicleCategoryId: string,
    lat: number,
    lng: number,
    radius: number,
    geoMatchCount: number,
  ) {
    const ids = await this.bookings.listOnlineDriverIdsForCategory(vehicleCategoryId);
    const online = await this.offers.findDriversByIds(ids);

    return online
      .filter((d) => typeof d.lastLat === "number" && typeof d.lastLng === "number")
      .map((d) => ({
        driverId: d.id,
        distance: haversineKm({ lat, lng }, { lat: d.lastLat as number, lng: d.lastLng as number }),
      }))
      .filter((n) => n.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, geoMatchCount);
  }
}
