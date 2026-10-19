import { Inject, Injectable } from "@nestjs/common";
import { WebsocketService } from "../../../infrastructure/websocket/websocket.service";
import { driversCategoryRoom } from "../../../infrastructure/websocket/constants/rooms";
import type { Payload } from "../../../infrastructure/websocket/types/websocket.types";
import { WS_EVENTS } from "../constants/booking.constants";

@Injectable()
export class RealtimeService {
  constructor(@Inject(WebsocketService) private readonly websocket: WebsocketService) {}

  available(vehicleCategoryId: string, payload: Payload): void {
    if (!this.websocket.isReady()) {
      return;
    }

    this.websocket.broadcastToRoom({
      room: driversCategoryRoom(vehicleCategoryId),
      event: WS_EVENTS.AVAILABLE,
      payload,
    });
  }

  taken(vehicleCategoryId: string, payload: Payload): void {
    if (!this.websocket.isReady()) {
      return;
    }

    this.websocket.broadcastToRoom({
      room: driversCategoryRoom(vehicleCategoryId),
      event: WS_EVENTS.TAKEN,
      payload,
    });
  }
}
