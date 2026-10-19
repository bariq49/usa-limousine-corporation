import { Inject, Injectable } from "@nestjs/common";
import { RedisService } from "../../../infrastructure/redis/redis.service";
import {
  ACCEPT_LOCK_TTL_SECONDS,
  DRIVER_CARD_TTL_SECONDS,
  OFFER_REDIS,
} from "../constants/offer.constants";
import type {
  AddOffer,
  BookingRef,
  ClaimIdem,
  DriverRef,
  OfferRef,
  PutCard,
  PutSession,
  TrackDrivers,
} from "../types/offer-cache";
import type { DriverCardCache, OfferSessionSnapshot } from "../types/offer";

@Injectable()
export class OfferCacheService {
  constructor(@Inject(RedisService) private readonly redis: RedisService) {}

  private client() {
    return this.redis.isConfigured() ? this.redis.getClient() : null;
  }

  async putSession(props: PutSession): Promise<void> {
    const client = this.client();
    if (!client) {
      return;
    }

    const { ttlSeconds, ...session } = props;
    const key = OFFER_REDIS.session(session.bookingId);
    await client.hset(key, {
      bookingId: session.bookingId,
      bookingNumber: session.bookingNumber,
      status: session.status,
      vehicleCategoryId: session.vehicleCategoryId,
      fairPrice: String(session.fairPrice),
      pickupLat: String(session.pickupLat),
      pickupLng: String(session.pickupLng),
      expiresAt: session.expiresAt,
      userId: session.userId,
      matchingRadius: String(session.matchingRadius),
    });
    await client.expire(key, ttlSeconds);
  }

  async updateSessionFairPrice(props: BookingRef & { fairPrice: number }): Promise<void> {
    const client = this.client();
    if (!client) {
      return;
    }
    const key = OFFER_REDIS.session(props.bookingId);
    const exists = await client.exists(key);
    if (!exists) {
      return;
    }
    await client.hset(key, { fairPrice: String(props.fairPrice) });
  }

  async getSession(props: BookingRef): Promise<OfferSessionSnapshot | null> {
    const client = this.client();
    if (!client) {
      return null;
    }

    const data = await client.hgetall(OFFER_REDIS.session(props.bookingId));
    if (!data?.["bookingId"]) {
      return null;
    }

    return {
      bookingId: data["bookingId"]!,
      bookingNumber: data["bookingNumber"] ?? "",
      status: data["status"] ?? "",
      vehicleCategoryId: data["vehicleCategoryId"] ?? "",
      fairPrice: Number(data["fairPrice"] ?? 0),
      pickupLat: Number(data["pickupLat"] ?? 0),
      pickupLng: Number(data["pickupLng"] ?? 0),
      expiresAt: data["expiresAt"] ?? "",
      userId: data["userId"] ?? "",
      matchingRadius: Number(data["matchingRadius"] ?? 0),
    };
  }

  async clearSession(props: BookingRef): Promise<void> {
    const client = this.client();
    if (!client) {
      return;
    }

    const { bookingId } = props;
    await client.del(
      OFFER_REDIS.session(bookingId),
      OFFER_REDIS.list(bookingId),
      OFFER_REDIS.drivers(bookingId),
      OFFER_REDIS.accept(bookingId),
    );
  }

  async trackDrivers(props: TrackDrivers): Promise<void> {
    const { bookingId, driverIds, ttlSeconds } = props;
    const client = this.client();
    if (!client || driverIds.length === 0) {
      return;
    }

    const key = OFFER_REDIS.drivers(bookingId);
    await client.sadd(key, ...driverIds);
    await client.expire(key, ttlSeconds);
  }

  async listDrivers(props: BookingRef): Promise<string[]> {
    const client = this.client();
    if (!client) {
      return [];
    }
    return client.smembers(OFFER_REDIS.drivers(props.bookingId));
  }

  async addOffer(props: AddOffer): Promise<void> {
    const { bookingId, offerId, quotedPrice, ttlSeconds } = props;
    const client = this.client();
    if (!client) {
      return;
    }

    const key = OFFER_REDIS.list(bookingId);
    await client.zadd(key, String(quotedPrice), offerId);
    await client.expire(key, ttlSeconds);
  }

  async removeOffer(props: OfferRef): Promise<void> {
    const client = this.client();
    if (!client) {
      return;
    }
    await client.zrem(OFFER_REDIS.list(props.bookingId), props.offerId);
  }

  async listOffers(props: BookingRef): Promise<string[]> {
    const client = this.client();
    if (!client) {
      return [];
    }
    return client.zrange(OFFER_REDIS.list(props.bookingId), "0", "-1");
  }

  async tryLock(props: OfferRef): Promise<boolean> {
    const { bookingId, offerId } = props;
    const client = this.client();
    if (!client) {
      return true;
    }

    const result = await client.set(
      OFFER_REDIS.accept(bookingId),
      offerId,
      "EX",
      ACCEPT_LOCK_TTL_SECONDS,
      "NX",
    );
    if (result === "OK") {
      return true;
    }
    return (await client.get(OFFER_REDIS.accept(bookingId))) === offerId;
  }

  async releaseLock(props: OfferRef): Promise<void> {
    const { bookingId, offerId } = props;
    const client = this.client();
    if (!client) {
      return;
    }

    const current = await client.get(OFFER_REDIS.accept(bookingId));
    if (current === offerId) {
      await client.del(OFFER_REDIS.accept(bookingId));
    }
  }

  async putCard(props: PutCard): Promise<void> {
    const client = this.client();
    if (!client) {
      return;
    }

    const { card } = props;
    await client.set(
      OFFER_REDIS.card(card.driverId),
      JSON.stringify(card),
      "EX",
      DRIVER_CARD_TTL_SECONDS,
    );
  }

  async getCard(props: DriverRef): Promise<DriverCardCache | null> {
    const client = this.client();
    if (!client) {
      return null;
    }

    const raw = await client.get(OFFER_REDIS.card(props.driverId));
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as DriverCardCache;
    } catch {
      return null;
    }
  }

  async claimIdem(props: ClaimIdem): Promise<boolean> {
    const { actor, key, ttlSeconds } = props;
    const client = this.client();
    if (!client) {
      return true;
    }

    const result = await client.set(OFFER_REDIS.idem(actor, key), "1", "EX", ttlSeconds, "NX");
    return result === "OK";
  }
}
