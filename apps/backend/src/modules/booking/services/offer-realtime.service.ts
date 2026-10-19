import { Inject, Injectable } from "@nestjs/common";
import { WebsocketService } from "../../../infrastructure/websocket/websocket.service";
import { driverRoom, userRoom } from "../../../infrastructure/websocket/constants/rooms";
import type { Payload } from "../../../infrastructure/websocket/types/websocket.types";
import { OFFER_WS_EVENTS } from "../constants/offer.constants";

@Injectable()
export class OfferRealtimeService {
  constructor(@Inject(WebsocketService) private readonly websocket: WebsocketService) {}

  requestToDrivers(driverIds: string[], payload: Payload): void {
    if (!this.websocket.isReady()) {
      return;
    }
    for (const driverId of driverIds) {
      this.websocket.broadcastToRoom({
        room: driverRoom(driverId),
        event: OFFER_WS_EVENTS.REQUEST,
        payload,
      });
    }
  }

  toCustomer(userId: string | null | undefined, event: string, payload: Payload): void {
    if (!this.websocket.isReady() || !userId) {
      return;
    }
    this.websocket.broadcastToRoom({
      room: userRoom(userId),
      event,
      payload,
    });
  }

  offerCreated(userId: string | null | undefined, payload: Payload): void {
    this.toCustomer(userId, OFFER_WS_EVENTS.CREATED, payload);
  }

  offerUpdated(userId: string | null | undefined, payload: Payload): void {
    this.toCustomer(userId, OFFER_WS_EVENTS.UPDATED, payload);
  }

  resultToDrivers(driverIds: string[], payload: Payload): void {
    if (!this.websocket.isReady()) {
      return;
    }
    for (const driverId of driverIds) {
      this.websocket.broadcastToRoom({
        room: driverRoom(driverId),
        event: OFFER_WS_EVENTS.RESULT,
        payload,
      });
    }
  }

  sessionExpired(userId: string | null | undefined, payload: Payload): void {
    this.toCustomer(userId, OFFER_WS_EVENTS.SESSION_EXPIRED, payload);
  }
}
