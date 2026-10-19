import { Inject, Injectable } from "@nestjs/common";
import { WebsocketService } from "../../../infrastructure/websocket/websocket.service";
import { driverRoom, opsFleetRoom } from "../../../infrastructure/websocket/constants/rooms";
import type { Payload } from "../../../infrastructure/websocket/types/websocket.types";
import { DRIVER_WALLET_WS_EVENTS, WALLET_WS_EVENTS } from "../../wallet/constants/wallet.constants";
import { DRIVER_WS_EVENTS, FLEET_WS_EVENTS } from "../constants/driver.constants";
import type { RealtimePayload } from "../types/presence";

@Injectable()
export class DriverRealtimeService {
  constructor(@Inject(WebsocketService) private readonly websocketService: WebsocketService) {}

  emitUpdated(payload: RealtimePayload): void {
    if (!this.websocketService.isReady()) {
      return;
    }

    const data: Payload = {
      driverId: payload.driverId,
      online: payload.online,
      presenceStatus: payload.presenceStatus,
      presenceDeviceId: payload.presenceDeviceId,
      sessionId: payload.sessionId,
      startedAt: payload.startedAt?.toISOString() ?? null,
      endedAt: payload.endedAt?.toISOString() ?? null,
      duration: payload.duration,
      extra: payload.extra,
      endedReason: payload.endedReason,
      lastLat: payload.lastLat,
      lastLng: payload.lastLng,
      locationUpdatedAt: payload.locationUpdatedAt?.toISOString() ?? null,
      vehicleCategoryId: payload.vehicleCategoryId,
    };

    this.websocketService.broadcastToRoom({
      room: driverRoom(payload.driverId),
      event: DRIVER_WS_EVENTS.PRESENCE_UPDATED,
      payload: data,
    });

    this.websocketService.broadcastToRoom({
      room: opsFleetRoom(),
      event: FLEET_WS_EVENTS.UPDATED,
      payload: data,
    });
  }

  emitWalletCredited(driverId: string, payload: Payload): void {
    if (!this.websocketService.isReady()) {
      return;
    }

    const room = driverRoom(driverId);
    this.websocketService.broadcastToRoom({
      room,
      event: WALLET_WS_EVENTS.CREDITED,
      payload,
    });
    this.websocketService.broadcastToRoom({
      room,
      event: DRIVER_WALLET_WS_EVENTS.CREDITED,
      payload,
    });
  }
}
