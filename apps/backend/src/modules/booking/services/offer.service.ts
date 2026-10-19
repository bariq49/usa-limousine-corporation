import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  BookingOfferStatus,
  BookingStatus,
  DriverPresenceStatus,
  PaymentPurpose,
  Prisma,
  TripStatus,
} from "@prisma/client";
import type { Request } from "express";
import { auditLog } from "../../../common/utils/audit-log";
import { roundAmount } from "../../../common/utils/money";
import { toRequestContext } from "../../../common/utils/to-request-context";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { requireDriver } from "../../driver/utils/require-driver";
import { DriverRepository } from "../../driver/repositories/driver.repository";
import { CheckoutService } from "../../payment/services/checkout.service";
import { DriverGeoService } from "../../driver/services/geo.service";
import { DriverRequestEventService } from "../../driver/services/request-event.service";
import { SettingsRepository } from "../../settings/repositories/settings.repository";
import { OFFER_EVENT } from "../constants/offer.events";
import type { AcceptDto, AvailableQueryDto, CounterDto, CreateDto } from "../dto/offer.dto";
import { BookingRepository } from "../repositories/booking.repository";
import { OfferRepository } from "../repositories/offer.repository";
import type {
  AcceptOfferResult,
  BookingPickupAddress,
  BookingPricingSnapshot,
  BuildDriverCardInput,
  DriverCardCache,
  LatLng,
  NearbyDriversResult,
  OfferListItem,
  PaymentReleaseMetric,
  ResolveDriverCardOffer,
  ResumeCheckoutResult,
  StartSeekingResult,
} from "../types/offer";
import { BookingQueueService } from "../jobs/booking-queue.service";
import { MatchingService } from "./matching.service";
import { NotifyService } from "./notify.service";
import { OfferCacheService } from "./offer-cache.service";
import { OfferMetricsService } from "./offer-metrics.service";
import { OfferRateLimitService } from "./offer-rate-limit.service";
import { OfferRealtimeService } from "./offer-realtime.service";

function haversineKm(a: LatLng, b: LatLng) {
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
export class OfferService {
  constructor(
    @Inject(OfferRepository) private readonly offers: OfferRepository,
    @Inject(BookingRepository) private readonly bookings: BookingRepository,
    @Inject(DriverRepository) private readonly drivers: DriverRepository,
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(OfferCacheService) private readonly cache: OfferCacheService,
    @Inject(OfferRealtimeService) private readonly realtime: OfferRealtimeService,
    @Inject(MatchingService) private readonly matching: MatchingService,
    @Inject(forwardRef(() => BookingQueueService)) private readonly queue: BookingQueueService,
    @Inject(CheckoutService) private readonly checkout: CheckoutService,
    @Inject(NotifyService) private readonly notify: NotifyService,
    @Inject(EventEmitter2) private readonly events: EventEmitter2,
    @Inject(OfferRateLimitService) private readonly rateLimit: OfferRateLimitService,
    @Inject(OfferMetricsService) private readonly metrics: OfferMetricsService,
    @Inject(DriverGeoService) private readonly geo: DriverGeoService,
    @Inject(SettingsRepository) private readonly settings: SettingsRepository,
    @Inject(DriverRequestEventService) private readonly requestEvents: DriverRequestEventService,
  ) {}

  async startSeeking(bookingId: string, request?: Request): Promise<StartSeekingResult> {
    if (request) {
      await this.rateLimit.seek(request.ip || "unknown");
    }
    const booking = await this.bookings.findById(bookingId);
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    if (!booking.userId) {
      throw new BadRequestException("Booking has no owning customer");
    }

    const offerCfg = await this.settings.getOfferMarketplace();
    const sessionTtlMin = offerCfg.sessionTtlMin;
    const expiresAt = new Date(Date.now() + sessionTtlMin * 60_000);
    const radius = booking.matchingRadius ?? offerCfg.radius;
    const address = booking.address as BookingPickupAddress;

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.SEEKING_OFFERS,
        offerSessionExpiresAt: expiresAt,
        matchingRadius: radius,
      },
    });

    const fairPrice = Number((booking.pricing as BookingPricingSnapshot)?.total) || 0;
    await this.cache.putSession({
      bookingId,
      bookingNumber: booking.bookingNumber,
      status: BookingStatus.SEEKING_OFFERS,
      vehicleCategoryId: booking.vehicleCategoryId,
      fairPrice,
      pickupLat: address.pickup?.latitude ?? 0,
      pickupLng: address.pickup?.longitude ?? 0,
      expiresAt: expiresAt.toISOString(),
      userId: booking.userId,
      matchingRadius: radius,
      ttlSeconds: sessionTtlMin * 60,
    });

    await this.queue.enqueueMatchDispatch(bookingId);
    await this.queue.enqueueSessionExpire(bookingId, expiresAt);
    await this.notify.available({ bookingId });

    this.events.emit(OFFER_EVENT.SEEKING_STARTED, {
      bookingId,
      bookingNumber: booking.bookingNumber,
      userId: booking.userId,
      offerSessionExpiresAt: expiresAt.toISOString(),
    });
    await this.metrics.incr("seek_started");

    return {
      offerSessionExpiresAt: expiresAt,
      matchingRadius: radius,
    };
  }

  async listForCustomer(bookingId: string, request: Request): Promise<OfferListItem[]> {
    const { userId } = toRequestContext(request);
    await this.rateLimit.list(userId!);
    const booking = await this.bookings.findOwnedByUser(bookingId, userId!);
    if (!booking) {
      throw new ForbiddenException("Booking not found");
    }

    return this.mapOffersForBooking(bookingId, booking.pricing as BookingPricingSnapshot);
  }

  async getCurrentForCustomer(request: Request) {
    const { userId } = toRequestContext(request);
    const booking = await this.bookings.findCurrentForUser(userId!);
    if (!booking) {
      return { booking: null, offers: [] as OfferListItem[] };
    }
    await this.rateLimit.list(userId!);
    const offers = await this.mapOffersForBooking(
      booking.id,
      booking.pricing as BookingPricingSnapshot,
    );
    return { booking, offers };
  }

  async getBookingForCustomer(bookingId: string, request: Request) {
    const { userId } = toRequestContext(request);
    const detail = await this.bookings.findById(bookingId);
    if (!detail || detail.userId !== userId) {
      throw new NotFoundException("Booking not found");
    }
    await this.rateLimit.list(userId!);
    const offers = await this.mapOffersForBooking(
      bookingId,
      detail.pricing as BookingPricingSnapshot,
    );
    return { booking: detail, offers };
  }

  async counter(bookingId: string, body: CounterDto, request: Request) {
    const context = toRequestContext(request);
    const { userId } = context;
    const booking = await this.bookings.findOwnedByUser(bookingId, userId!);
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }
    if (booking.status !== BookingStatus.SEEKING_OFFERS) {
      throw new BadRequestException("Can only raise price while seeking offers");
    }
    if (booking.offerSessionExpiresAt && booking.offerSessionExpiresAt.getTime() <= Date.now()) {
      throw new BadRequestException("Offer session has expired");
    }

    const pricing = (booking.pricing ?? {}) as BookingPricingSnapshot & Record<string, unknown>;
    const currentTotal = Number(pricing.total) || 0;
    const nextTotal = roundAmount(body.total);
    if (!(nextTotal > currentTotal)) {
      throw new BadRequestException(
        `New total must be greater than current price (${currentTotal.toFixed(2)})`,
      );
    }

    const nextPricing = Object.assign({}, pricing, { total: nextTotal });
    await this.bookings.updatePricing(bookingId, nextPricing as Prisma.InputJsonValue);
    await this.cache.updateSessionFairPrice({ bookingId, fairPrice: nextTotal });
    await this.offers.recalcFairPriceDeltas(bookingId, nextTotal);

    const quotedDriverIds = await this.offers.listPendingDriverIds(bookingId);
    const tracked = await this.cache.listDrivers({ bookingId });
    this.realtime.requestToDrivers(tracked, {
      type: "BOOKING_PRICE_UPDATED",
      payload: { bookingId, fairPrice: nextTotal, previousFairPrice: currentTotal },
    });
    await this.notify.available({
      bookingId,
      excludeDriverIds: quotedDriverIds,
      title: "Ride price updated — submit your offer",
      body: `Customer raised the price on booking ${booking.bookingNumber}`,
    });

    await auditLog({
      prisma: this.prisma,
      event: "booking.price_countered",
      result: "success",
      context,
      userId,
      metadata: {
        bookingId,
        previousTotal: currentTotal,
        total: nextTotal,
      },
    });

    this.events.emit(OFFER_EVENT.PRICE_COUNTERED, {
      bookingId,
      userId,
      previousTotal: currentTotal,
      total: nextTotal,
    });

    const offers = await this.mapOffersForBooking(bookingId, { total: nextTotal });
    const updated = await this.bookings.findById(bookingId);
    return { booking: updated, offers };
  }

  async mapOffersForBooking(
    bookingId: string,
    pricing: BookingPricingSnapshot,
  ): Promise<OfferListItem[]> {
    const fairPrice = Number(pricing?.total) || 0;
    const offerIds = await this.cache.listOffers({ bookingId });
    let rows =
      offerIds.length > 0
        ? await this.offers.listByIds(offerIds)
        : await this.offers.listPendingByBooking(bookingId);

    rows = rows.filter((o) => o.status === BookingOfferStatus.PENDING);

    const cards = await Promise.all(rows.map((o) => this.resolveDriverCard(o)));
    return rows.map((o, i) => ({
      id: o.id,
      bookingId: o.bookingId,
      driverId: o.driverId,
      vehicleId: o.vehicleId,
      quotedPrice: o.quotedPrice,
      fairPrice,
      fairPriceDelta: o.fairPriceDelta ?? roundAmount(o.quotedPrice - fairPrice),
      etaMinutes: o.etaMinutes,
      distance: o.distance,
      status: o.status,
      expiresAt: o.expiresAt.toISOString(),
      driver: cards[i]!,
    }));
  }

  async listNearbyDrivers(bookingId: string, request: Request): Promise<NearbyDriversResult> {
    const { userId } = toRequestContext(request);
    const booking = await this.bookings.findOwnedByUser(bookingId, userId!);
    if (!booking) {
      throw new ForbiddenException("Booking not found");
    }

    const offerCfg = await this.settings.getOfferMarketplace();
    const radius = booking.matchingRadius ?? offerCfg.radius;
    const address = booking.address as BookingPickupAddress;
    const lat = address.pickup?.latitude;
    const lng = address.pickup?.longitude;
    if (typeof lat !== "number" || typeof lng !== "number") {
      return { bookingId, radius, pickup: null, drivers: [] };
    }

    let nearby = await this.geo.searchNearby({
      lat,
      lng,
      radius,
      categoryId: booking.vehicleCategoryId,
      count: offerCfg.geoMatchCount,
    });

    const freeIds = await this.geo.filterBusy({
      driverIds: nearby.map((n) => n.driverId),
    });
    const freeSet = new Set(freeIds);
    nearby = nearby.filter((n) => freeSet.has(n.driverId));

    const drivers = await this.offers.findDriversByIds(nearby.map((n) => n.driverId));
    const byId = new Map(drivers.map((d) => [d.id, d]));

    const pins = [];
    for (const n of nearby) {
      const driver = byId.get(n.driverId);
      if (!driver || typeof driver.lastLat !== "number" || typeof driver.lastLng !== "number") {
        continue;
      }
      if (
        !driver.vehicle ||
        driver.vehicle.deletedAt ||
        driver.vehicle.vehicleCategoryId !== booking.vehicleCategoryId
      ) {
        continue;
      }
      pins.push({
        id: driver.id,
        firstName: driver.firstName,
        lastName: driver.lastName,
        avatarUrl: driver.avatarUrl,
        rating: Number((driver.ratingAvg ?? 0).toFixed(2)),
        lat: driver.lastLat,
        lng: driver.lastLng,
        distance: Number(n.distance.toFixed(2)),
      });
    }

    return {
      bookingId,
      radius,
      pickup: { latitude: lat, longitude: lng },
      drivers: pins,
    };
  }

  async quote(body: CreateDto, request: Request) {
    const context = toRequestContext(request);
    const driver = await requireDriver(this.drivers, request);
    await this.rateLimit.quote(driver.id);

    if (driver.presenceStatus !== DriverPresenceStatus.ONLINE) {
      await this.metrics.incr("quote_rejected");
      throw new BadRequestException("Go online to submit an offer");
    }
    if (!driver.vehicle || driver.vehicle.deletedAt) {
      throw new BadRequestException("Driver vehicle is required before quoting");
    }

    if (body.idempotencyKey) {
      const claimed = await this.cache.claimIdem({
        actor: driver.id,
        key: `quote:${body.idempotencyKey}`,
        ttlSeconds: 120,
      });
      if (!claimed) {
        const existing = await this.offers.findPendingByBookingDriver(body.bookingId, driver.id);
        if (existing) {
          return existing;
        }
      }
    }

    const booking = await this.bookings.findById(body.bookingId);
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }
    if (booking.status !== BookingStatus.SEEKING_OFFERS) {
      throw new BadRequestException("Booking is not seeking offers");
    }
    if (booking.offerSessionExpiresAt && booking.offerSessionExpiresAt.getTime() <= Date.now()) {
      throw new BadRequestException("Offer session has expired");
    }
    if (booking.vehicleCategoryId !== driver.vehicle.vehicleCategoryId) {
      throw new BadRequestException("Vehicle category does not match booking");
    }

    const declined = await this.prisma.driverBookingDecline.findUnique({
      where: {
        driverId_bookingId: { driverId: driver.id, bookingId: booking.id },
      },
      select: { id: true },
    });
    if (declined) {
      throw new BadRequestException("You declined this booking");
    }

    const existing = await this.offers.findPendingByBookingDriver(booking.id, driver.id);
    if (existing) {
      throw new ConflictException("You already have a pending offer on this booking");
    }

    const offerCfg = await this.settings.getOfferMarketplace();
    const pendingCount = await this.offers.countPendingByBooking(booking.id);
    if (pendingCount >= offerCfg.maxPerBooking) {
      throw new BadRequestException("This booking already has the maximum number of offers");
    }

    const driverQuotes = await this.offers.countPendingByDriver(driver.id);
    if (driverQuotes >= offerCfg.maxQuotesPerDriver) {
      throw new BadRequestException("You have too many active quotes");
    }

    const fairPrice = Number((booking.pricing as BookingPricingSnapshot)?.total) || 0;
    const quoted =
      body.quotedPrice != null && Number.isFinite(body.quotedPrice)
        ? roundAmount(body.quotedPrice)
        : fairPrice;
    if (!(quoted > 0)) {
      throw new BadRequestException(
        "No fair price on booking — provide quotedPrice to submit an offer",
      );
    }
    if (fairPrice > 0 && body.quotedPrice != null) {
      const min = fairPrice * offerCfg.quoteMinFactor;
      const max = fairPrice * offerCfg.quoteMaxFactor;
      if (quoted < min || quoted > max) {
        throw new BadRequestException(
          `Quoted price must be between ${min.toFixed(2)} and ${max.toFixed(2)}`,
        );
      }
    }

    const address = booking.address as BookingPickupAddress;
    let distance: number | null = null;
    let etaMinutes: number | null = null;
    if (
      typeof driver.lastLat === "number" &&
      typeof driver.lastLng === "number" &&
      typeof address.pickup?.latitude === "number" &&
      typeof address.pickup?.longitude === "number"
    ) {
      distance = Number(
        haversineKm(
          { lat: driver.lastLat, lng: driver.lastLng },
          { lat: address.pickup.latitude, lng: address.pickup.longitude },
        ).toFixed(2),
      );
      etaMinutes = Math.max(1, Math.round((distance / 30) * 60));
    }

    const expiresAt = new Date(Date.now() + offerCfg.ttlMin * 60_000);
    const fairPriceDelta = roundAmount(quoted - fairPrice);

    let offer;
    try {
      offer = await this.offers.create({
        bookingId: booking.id,
        driverId: driver.id,
        vehicleId: driver.vehicle.id,
        quotedPrice: quoted,
        etaMinutes,
        distance,
        fairPriceDelta,
        expiresAt,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("You already have a pending offer on this booking");
      }
      throw error;
    }

    const ttl = offerCfg.sessionTtlMin * 60;
    await this.cache.addOffer({
      bookingId: booking.id,
      offerId: offer.id,
      quotedPrice: quoted,
      ttlSeconds: ttl,
    });
    await this.cache.trackDrivers({
      bookingId: booking.id,
      driverIds: [driver.id],
      ttlSeconds: ttl,
    });
    await this.cache.putCard({ card: this.buildDriverCard(driver) });

    this.realtime.resultToDrivers([driver.id], {
      type: "BOOKING_QUOTED",
      payload: { bookingId: booking.id, offerId: offer.id },
    });

    if (booking.userId) {
      this.realtime.offerCreated(booking.userId, {
        type: "OFFER_CREATED",
        payload: {
          offerId: offer.id,
          bookingId: booking.id,
          driverId: driver.id,
          quotedPrice: quoted,
          etaMinutes,
          distance,
          fairPrice,
          fairPriceDelta,
        },
      });
      await this.notify.offerReceived({
        userId: booking.userId,
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
        offerId: offer.id,
        quotedPrice: quoted,
        driverId: driver.id,
        etaMinutes,
        distance,
      });
    }

    await this.queue.enqueueOfferExpire(offer.id, expiresAt);

    await auditLog({
      prisma: this.prisma,
      event: "booking.offer.created",
      result: "success",
      context,
      userId: context.userId,
      metadata: { offerId: offer.id, bookingId: booking.id, quotedPrice: quoted },
    });

    this.events.emit(OFFER_EVENT.CREATED, {
      offerId: offer.id,
      bookingId: booking.id,
      driverId: driver.id,
      quotedPrice: quoted,
    });
    await this.metrics.incr("quote_created");

    return offer;
  }

  async accept(
    offerId: string,
    body: AcceptDto,
    request: Request,
  ): Promise<AcceptOfferResult | ResumeCheckoutResult> {
    const started = Date.now();
    const { userId } = toRequestContext(request);
    await this.rateLimit.accept(userId!);

    const target = await this.offers.findById(offerId);
    if (!target) {
      throw new NotFoundException("Offer not found");
    }
    const bookingId = target.bookingId;
    const owned = await this.bookings.findOwnedByUser(bookingId, userId!);
    if (!owned) {
      throw new ForbiddenException("Booking not found");
    }

    if (body.idempotencyKey) {
      const claimed = await this.cache.claimIdem({
        actor: "accept",
        key: `${bookingId}:${body.idempotencyKey}`,
        ttlSeconds: 300,
      });
      if (!claimed) {
        const existing = await this.bookings.findById(bookingId);
        if (
          existing?.status === BookingStatus.AWAITING_PAYMENT &&
          existing.acceptedOfferId === offerId
        ) {
          return this.resumeCheckout(bookingId, offerId, body, request);
        }
      }
    }
    {
      const current = await this.bookings.findById(bookingId);
      if (
        current?.status === BookingStatus.AWAITING_PAYMENT &&
        current.acceptedOfferId === offerId
      ) {
        return this.resumeCheckout(bookingId, offerId, body, request);
      }
    }

    const locked = await this.cache.tryLock({ bookingId, offerId });
    if (!locked) {
      await this.metrics.incr("accept_conflict");
      throw new ConflictException("Another offer is being accepted for this booking");
    }

    try {
      const offer = await this.offers.findById(offerId);
      if (!offer || offer.bookingId !== bookingId) {
        throw new NotFoundException("Offer not found");
      }
      if (
        offer.status === BookingOfferStatus.ACCEPTED &&
        offer.booking.status === BookingStatus.AWAITING_PAYMENT
      ) {
        return this.resumeCheckout(bookingId, offerId, body, request);
      }
      if (offer.status !== BookingOfferStatus.PENDING) {
        throw new BadRequestException("Offer is no longer available");
      }
      if (offer.expiresAt.getTime() <= Date.now()) {
        await this.offers.updateStatus(offerId, BookingOfferStatus.EXPIRED);
        throw new BadRequestException("Offer has expired");
      }
      if (offer.booking.status !== BookingStatus.SEEKING_OFFERS) {
        throw new BadRequestException("Booking is not seeking offers");
      }

      await this.prisma.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`offer-accept:${bookingId}`}))`;

        const current = await tx.booking.findFirst({
          where: { id: bookingId, deletedAt: null },
        });
        if (!current || current.status !== BookingStatus.SEEKING_OFFERS) {
          throw new ConflictException("Booking is no longer seeking offers");
        }
        if (current.acceptedOfferId) {
          throw new ConflictException("An offer was already accepted");
        }

        await tx.bookingOffer.update({
          where: { id: offerId },
          data: { status: BookingOfferStatus.ACCEPTED },
        });
        await tx.bookingOffer.updateMany({
          where: {
            bookingId,
            id: { not: offerId },
            status: BookingOfferStatus.PENDING,
          },
          data: { status: BookingOfferStatus.SUPERSEDED },
        });
        await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: BookingStatus.AWAITING_PAYMENT,
            acceptedOfferId: offerId,
          },
        });
      });

      const quotedPrice = offer.quotedPrice;
      const checkoutInput = {
        purpose: PaymentPurpose.BOOKING,
        referenceId: bookingId,
        amount: quotedPrice,
        description: `Booking ${offer.booking.bookingNumber} — accepted offer`,
      };
      if (body.successUrl !== undefined) {
        Object.assign(checkoutInput, { successUrl: body.successUrl });
      }
      if (body.cancelUrl !== undefined) {
        Object.assign(checkoutInput, { cancelUrl: body.cancelUrl });
      }

      const checkout = await this.checkout.createSession(checkoutInput, request);

      const tracked = await this.cache.listDrivers({ bookingId });
      this.realtime.resultToDrivers(
        tracked.filter((id) => id !== offer.driverId),
        {
          type: "OFFER_SUPERSEDED",
          payload: { bookingId, acceptedOfferId: offerId },
        },
      );
      this.realtime.resultToDrivers([offer.driverId], {
        type: "OFFER_ACCEPTED",
        payload: { bookingId, offerId },
      });

      if (offer.booking.userId) {
        this.realtime.offerUpdated(offer.booking.userId, {
          type: "OFFER_ACCEPTED",
          payload: { bookingId, offerId, quotedPrice },
        });
      }

      await this.notify.offerAccepted({
        bookingId,
        bookingNumber: offer.booking.bookingNumber,
        offerId,
        driverId: offer.driverId,
        quotedPrice,
        vehicleCategoryId: offer.booking.vehicleCategoryId,
      });

      this.events.emit(OFFER_EVENT.ACCEPTED, {
        offerId,
        bookingId,
        driverId: offer.driverId,
        quotedPrice,
      });
      const policy = await this.settings.getCancelPolicy();
      await this.queue.enqueuePaymentTimeout(bookingId, policy.paymentTimeoutMin);

      await this.metrics.incr("accept_ok");
      await this.metrics.timing("accept_ms", Date.now() - started);

      return {
        bookingId,
        offerId,
        quotedPrice,
        paymentId: checkout.paymentId,
        checkoutUrl: checkout.checkoutUrl,
        sessionId: checkout.sessionId,
        paymentTimeoutMin: policy.paymentTimeoutMin,
      };
    } catch (error) {
      await this.cache.releaseLock({ bookingId, offerId });
      throw error;
    }
  }

  async decline(offerId: string, request: Request) {
    const { userId } = toRequestContext(request);
    await this.rateLimit.accept(userId!);

    const offer = await this.offers.findById(offerId);
    if (!offer) {
      throw new NotFoundException("Offer not found");
    }
    const bookingId = offer.bookingId;
    const booking = await this.bookings.findOwnedByUser(bookingId, userId!);
    if (!booking) {
      throw new ForbiddenException("Booking not found");
    }
    if (booking.status !== BookingStatus.SEEKING_OFFERS) {
      throw new BadRequestException("Booking is not seeking offers");
    }
    if (offer.status !== BookingOfferStatus.PENDING) {
      throw new BadRequestException("Offer is no longer pending");
    }

    await this.offers.updateStatus(offerId, BookingOfferStatus.DECLINED_BY_CUSTOMER);
    await this.cache.removeOffer({ bookingId, offerId });

    this.realtime.resultToDrivers([offer.driverId], {
      type: "OFFER_DECLINED",
      payload: { bookingId, offerId },
    });
    if (booking.userId) {
      this.realtime.offerUpdated(booking.userId, {
        type: "OFFER_DECLINED",
        payload: { bookingId, offerId },
      });
    }
    this.relistAvailableForDriver(offer.driverId, booking);

    this.events.emit(OFFER_EVENT.DECLINED, { offerId, bookingId, driverId: offer.driverId });
    return { ok: true };
  }

  async declineAvailable(bookingId: string, request: Request) {
    const driver = await requireDriver(this.drivers, request);
    await this.rateLimit.quote(driver.id);

    const booking = await this.bookings.findById(bookingId);
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }
    if (booking.status !== BookingStatus.SEEKING_OFFERS) {
      throw new BadRequestException("Booking is not available to decline");
    }

    await this.prisma.driverBookingDecline.upsert({
      where: {
        driverId_bookingId: { driverId: driver.id, bookingId },
      },
      create: { driverId: driver.id, bookingId },
      update: {},
    });
    await this.requestEvents.markNotAccepted({
      bookingId,
      driverId: driver.id,
    });

    const pending = await this.offers.findPendingByBookingDriver(bookingId, driver.id);
    if (pending) {
      await this.offers.updateStatus(pending.id, BookingOfferStatus.WITHDRAWN);
      await this.cache.removeOffer({ bookingId, offerId: pending.id });

      if (booking.userId) {
        this.realtime.offerUpdated(booking.userId, {
          type: "OFFER_WITHDRAWN",
          payload: { bookingId, offerId: pending.id },
        });
      }

      this.events.emit(OFFER_EVENT.WITHDRAWN, {
        offerId: pending.id,
        bookingId,
        driverId: driver.id,
      });
    }

    this.realtime.resultToDrivers([driver.id], {
      type: "BOOKING_DECLINED",
      payload: { bookingId },
    });

    const context = toRequestContext(request);
    await auditLog({
      prisma: this.prisma,
      event: "booking.available_declined",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        bookingId,
        driverId: driver.id,
        withdrewOfferId: pending?.id ?? null,
      },
    });

    return { ok: true };
  }

  async cancelSeeking(bookingId: string, request: Request) {
    const { userId } = toRequestContext(request);
    const booking = await this.bookings.findOwnedByUser(bookingId, userId!);
    if (!booking) {
      throw new ForbiddenException("Booking not found");
    }
    if (
      booking.status !== BookingStatus.SEEKING_OFFERS &&
      booking.status !== BookingStatus.AWAITING_PAYMENT
    ) {
      throw new BadRequestException("Booking cannot cancel seeking in this status");
    }

    await this.bookings.updateOfferSession(bookingId, {
      status: BookingStatus.CANCELLED,
      cancelledAt: new Date(),
      cancellationReason: "Customer cancelled offering session",
    });
    await this.prisma.bookingOffer.updateMany({
      where: { bookingId, status: BookingOfferStatus.PENDING },
      data: { status: BookingOfferStatus.SUPERSEDED },
    });

    const tracked = await this.cache.listDrivers({ bookingId });
    this.realtime.resultToDrivers(tracked, {
      type: "OFFER_SESSION_CANCELLED",
      payload: { bookingId },
    });
    if (booking.userId) {
      this.realtime.sessionExpired(booking.userId, {
        type: "OFFER_SESSION_CANCELLED",
        payload: { bookingId },
      });
    }
    await this.cache.clearSession({ bookingId });
    await this.requestEvents.markClientCancelled({ bookingId });
    return { ok: true };
  }

  async listAvailableForDriver(query: AvailableQueryDto, request: Request) {
    const driver = await requireDriver(this.drivers, request);
    if (!driver.vehicle) {
      return { data: [], nextCursor: null };
    }

    const limit = query.limit ?? 20;
    const declined = await this.prisma.driverBookingDecline.findMany({
      where: { driverId: driver.id },
      select: { bookingId: true },
    });
    const quoted = await this.offers.listPendingBookingIdsForDriver(driver.id);
    const exclude = Array.from(new Set([...declined.map((d) => d.bookingId), ...quoted]));
    const rows = await this.offers.findSeekingBookings({
      vehicleCategoryId: driver.vehicle.vehicleCategoryId,
      excludeBookingIds: exclude,
      take: limit + 1,
      ...(query.cursor ? { cursor: query.cursor } : {}),
    });

    const page = rows.slice(0, limit);
    const nextCursor = rows.length > limit ? (page[page.length - 1]?.id ?? null) : null;
    return { data: page, nextCursor };
  }

  async onMarketplacePaid(bookingId: string) {
    const booking = await this.bookings.findById(bookingId);
    if (!booking) {
      return;
    }
    if (
      booking.status !== BookingStatus.AWAITING_PAYMENT &&
      booking.status !== BookingStatus.PENDING
    ) {
      if (booking.status === BookingStatus.CONFIRMED) {
        return;
      }
    }

    const offerId = booking.acceptedOfferId;
    if (!offerId) {
      // Legacy prepaid path still uses PENDING → CONFIRMED via notify.available
      return null;
    }

    const offer = await this.offers.findById(offerId);
    if (!offer) {
      return null;
    }

    const trip = await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`offer-fulfill:${bookingId}`}))`;

      const existing = await tx.trip.findFirst({
        where: { bookingId, deletedAt: null },
      });
      if (existing) {
        return existing;
      }

      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.CONFIRMED,
          confirmedAt: new Date(),
        },
      });

      return tx.trip.create({
        data: {
          bookingId,
          driverId: offer.driverId,
          vehicleId: offer.vehicleId,
          status: TripStatus.ACCEPTED,
          acceptedAt: new Date(),
        },
      });
    });

    await this.offers.supersedeOthers(bookingId, offerId);
    await this.cache.clearSession({ bookingId });
    await this.geo.markBusy({ driverId: offer.driverId });

    await this.notify.taken({
      bookingId,
      tripId: trip.id,
      excludeDriverId: offer.driverId,
    });

    const tracked = await this.cache.listDrivers({ bookingId });
    this.realtime.resultToDrivers(
      tracked.filter((id) => id !== offer.driverId),
      {
        type: "BOOKING_TAKEN",
        payload: { bookingId, tripId: trip.id },
      },
    );

    this.events.emit(OFFER_EVENT.MARKETPLACE_PAID, {
      bookingId,
      offerId,
      driverId: offer.driverId,
      vehicleId: offer.vehicleId,
      tripId: trip.id,
    });
    await this.metrics.incr("payment_fulfilled");

    return trip;
  }

  async onPaymentFailed(bookingId: string) {
    return this.releaseAwaitingPayment(bookingId, "payment_failed_reopen");
  }

  async expirePayment(bookingId: string) {
    return this.releaseAwaitingPayment(bookingId, "payment_timeout_reopen");
  }

  async expireOffer(offerId: string) {
    const offer = await this.offers.findById(offerId);
    if (!offer || offer.status !== BookingOfferStatus.PENDING) {
      return;
    }
    if (offer.expiresAt.getTime() > Date.now()) {
      return;
    }
    await this.offers.updateStatus(offerId, BookingOfferStatus.EXPIRED);
    await this.cache.removeOffer({ bookingId: offer.bookingId, offerId });
    const booking = await this.bookings.findById(offer.bookingId);
    if (booking?.status === BookingStatus.SEEKING_OFFERS) {
      this.relistAvailableForDriver(offer.driverId, booking);
    }
    this.events.emit(OFFER_EVENT.EXPIRED, {
      offerId,
      bookingId: offer.bookingId,
      driverId: offer.driverId,
    });
    await this.metrics.incr("offer_expired");
  }

  async expireSession(bookingId: string) {
    const booking = await this.bookings.findById(bookingId);
    if (!booking || booking.status !== BookingStatus.SEEKING_OFFERS) {
      return;
    }
    if (booking.offerSessionExpiresAt && booking.offerSessionExpiresAt.getTime() > Date.now()) {
      return;
    }

    await this.bookings.updateOfferSession(bookingId, {
      status: BookingStatus.CANCELLED,
      cancelledAt: new Date(),
      cancellationReason: "Offer session expired",
    });
    await this.prisma.bookingOffer.updateMany({
      where: { bookingId, status: BookingOfferStatus.PENDING },
      data: { status: BookingOfferStatus.EXPIRED },
    });

    const tracked = await this.cache.listDrivers({ bookingId });
    this.realtime.resultToDrivers(tracked, {
      type: "OFFER_SESSION_EXPIRED",
      payload: { bookingId },
    });
    if (booking.userId) {
      this.realtime.sessionExpired(booking.userId, {
        type: "OFFER_SESSION_EXPIRED",
        payload: { bookingId },
      });
    }
    await this.cache.clearSession({ bookingId });
    await this.requestEvents.markNotAccepted({ bookingId });
    this.events.emit(OFFER_EVENT.SESSION_EXPIRED, { bookingId });
    await this.metrics.incr("session_expired");
  }

  async expandRadius(bookingId: string, radius: number) {
    const booking = await this.bookings.findById(bookingId);
    if (!booking || booking.status !== BookingStatus.SEEKING_OFFERS) {
      return;
    }
    const pending = await this.offers.countPendingByBooking(bookingId);
    if (pending > 0) {
      return;
    }
    const offerCfg = await this.settings.getOfferMarketplace();
    const next = Math.min(radius + offerCfg.expandStep, offerCfg.expandMax);
    if (next <= radius) {
      return;
    }
    await this.matching.dispatch(bookingId, next);
    if (next < offerCfg.expandMax) {
      await this.queue.enqueueRadiusExpand(bookingId, next, 30_000);
    }
  }

  async sweepExpired() {
    await this.offers.expireStale();
    const stale = await this.bookings.findStaleSeeking(new Date());
    for (const booking of stale) {
      await this.expireSession(booking.id);
    }
  }

  private buildDriverCard(driver: BuildDriverCardInput): DriverCardCache {
    return {
      driverId: driver.id,
      firstName: driver.firstName ?? "",
      lastName: driver.lastName ?? "",
      rating: Number((driver.ratingAvg ?? 0).toFixed(2)),
      rides: driver.completedTrips ?? 0,
      vehicleMake: driver.vehicle?.make ?? "",
      vehicleModel: driver.vehicle?.model ?? "",
      licensePlate: driver.vehicle?.licensePlate ?? "",
      avatarUrl: driver.avatarUrl,
    };
  }
  private async resumeCheckout(
    bookingId: string,
    offerId: string,
    body: AcceptDto,
    request?: Request,
  ): Promise<ResumeCheckoutResult> {
    const offer = await this.offers.findById(offerId);
    if (!offer || offer.bookingId !== bookingId) {
      throw new NotFoundException("Offer not found");
    }
    const quotedPrice = offer.quotedPrice;
    const checkoutInput = {
      purpose: PaymentPurpose.BOOKING,
      referenceId: bookingId,
      amount: quotedPrice,
      description: `Booking ${offer.booking.bookingNumber} — accepted offer`,
    };
    if (body.successUrl !== undefined) {
      Object.assign(checkoutInput, { successUrl: body.successUrl });
    }
    if (body.cancelUrl !== undefined) {
      Object.assign(checkoutInput, { cancelUrl: body.cancelUrl });
    }
    const checkout = await this.checkout.createSession(checkoutInput, request);
    await this.metrics.incr("accept_ok");
    return {
      bookingId,
      offerId,
      quotedPrice,
      paymentId: checkout.paymentId,
      checkoutUrl: checkout.checkoutUrl,
      sessionId: checkout.sessionId,
      resumed: true,
    };
  }
  relistAvailableForDriver(
    driverId: string,
    booking: {
      id: string;
      bookingNumber: string;
      pricing: unknown;
      address: unknown;
      bookingTime: unknown;
      passenger: unknown;
      vehicleCategoryId: string;
      offerSessionExpiresAt: Date | null;
      matchingRadius: number | null;
      createdAt: Date;
      status?: BookingStatus;
    },
  ) {
    if (booking.status !== undefined && booking.status !== BookingStatus.SEEKING_OFFERS) {
      return;
    }
    this.realtime.requestToDrivers([driverId], {
      type: "BOOKING_AVAILABLE",
      payload: {
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        pricing: booking.pricing,
        address: booking.address,
        bookingTime: booking.bookingTime,
        passenger: booking.passenger,
        vehicleCategoryId: booking.vehicleCategoryId,
        offerSessionExpiresAt: booking.offerSessionExpiresAt?.toISOString() ?? null,
        matchingRadius: booking.matchingRadius,
        createdAt: booking.createdAt.toISOString(),
      },
    });
  }

  private async resolveDriverCard(offer: ResolveDriverCardOffer): Promise<DriverCardCache> {
    const cached = await this.cache.getCard({ driverId: offer.driverId });
    if (cached) {
      return cached;
    }

    const stats = await this.offers.findDriverCardStats(offer.driverId);
    const card = this.buildDriverCard({
      id: offer.driverId,
      firstName: stats?.firstName ?? offer.driver.firstName,
      lastName: stats?.lastName ?? offer.driver.lastName,
      avatarUrl: stats?.avatarUrl ?? offer.driver.avatarUrl,
      ratingAvg: stats?.ratingAvg ?? offer.driver.ratingAvg ?? null,
      completedTrips: stats?.completedTrips ?? offer.driver.completedTrips ?? null,
      vehicle: stats?.vehicle ?? offer.vehicle,
    });
    await this.cache.putCard({ card });
    return card;
  }
  private async releaseAwaitingPayment(bookingId: string, metric: PaymentReleaseMetric) {
    const booking = await this.bookings.findById(bookingId);
    if (!booking || booking.status !== BookingStatus.AWAITING_PAYMENT) {
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      if (booking.acceptedOfferId) {
        await tx.bookingOffer.updateMany({
          where: { id: booking.acceptedOfferId, status: BookingOfferStatus.ACCEPTED },
          data: { status: BookingOfferStatus.PENDING },
        });
        await tx.bookingOffer.updateMany({
          where: {
            bookingId,
            id: { not: booking.acceptedOfferId },
            status: BookingOfferStatus.SUPERSEDED,
          },
          data: { status: BookingOfferStatus.PENDING },
        });
      }
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.SEEKING_OFFERS,
          acceptedOfferId: null,
        },
      });
    });

    await this.cache.releaseLock({ bookingId, offerId: booking.acceptedOfferId ?? "" });
    await this.queue.enqueueMatchDispatch(bookingId);
    await this.notify.available({ bookingId });
    await this.metrics.incr(metric);
  }
}
