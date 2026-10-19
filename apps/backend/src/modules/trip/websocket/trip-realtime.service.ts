import { Inject, Injectable } from "@nestjs/common";
import {
  driverRoom,
  opsFleetRoom,
  tripRoom,
  userRoom,
} from "../../../infrastructure/websocket/constants/rooms";
import { WebsocketService } from "../../../infrastructure/websocket/websocket.service";
import type { Payload as WsPayload } from "../../../infrastructure/websocket/types/websocket.types";
import { TRIP_WS_EVENTS } from "../constants/trip.constants";
import type { CallInviteParams, CallInvitePayload } from "../types/call";
import type { Payload, Rooms } from "../types/location";

@Injectable()
export class TripRealtimeService {
  constructor(@Inject(WebsocketService) private readonly websocket: WebsocketService) {}

  emit(payload: Payload): void {
    if (!this.websocket.isReady()) {
      return;
    }

    const data: WsPayload = { ...payload };

    this.websocket.broadcastToRoom({
      room: tripRoom(payload.tripId),
      event: TRIP_WS_EVENTS.LOCATION,
      payload: data,
    });

    this.websocket.broadcastToRoom({
      room: opsFleetRoom(),
      event: TRIP_WS_EVENTS.LOCATION,
      payload: data,
    });
  }

  emitCallInvite(params: CallInviteParams): void {
    if (!this.websocket.isReady()) {
      return;
    }

    const data: CallInvitePayload = {
      type: "CALL_INVITE",
      payload: {
        tripId: params.tripId,
        channel: params.channel,
        fromUserId: params.fromUserId,
        mode: "audio",
      },
    };

    this.websocket.broadcastToRoom({
      room: tripRoom(params.tripId),
      event: TRIP_WS_EVENTS.CALL,
      payload: data,
    });

    if (params.peerUserId) {
      this.websocket.broadcastToRoom({
        room: userRoom(params.peerUserId),
        event: TRIP_WS_EVENTS.CALL,
        payload: data,
      });
    }

    this.websocket.broadcastToRoom({
      room: driverRoom(params.driverId),
      event: TRIP_WS_EVENTS.CALL,
      payload: data,
    });
  }

  async join(params: Rooms): Promise<void> {
    if (!this.websocket.isReady()) {
      return;
    }

    const room = tripRoom(params.tripId);
    await this.websocket.setRoomMembership({
      from: driverRoom(params.driverId),
      room,
      join: true,
    });

    if (params.customerUserId) {
      await this.websocket.setRoomMembership({
        from: userRoom(params.customerUserId),
        room,
        join: true,
      });
    }
  }

  async leave(params: Rooms): Promise<void> {
    if (!this.websocket.isReady()) {
      return;
    }

    const room = tripRoom(params.tripId);
    await this.websocket.setRoomMembership({
      from: driverRoom(params.driverId),
      room,
      join: false,
    });

    if (params.customerUserId) {
      await this.websocket.setRoomMembership({
        from: userRoom(params.customerUserId),
        room,
        join: false,
      });
    }
  }
}
