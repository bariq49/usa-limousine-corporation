import { Inject } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from "@nestjs/websockets";
import type { Socket } from "socket.io";
import type { WebsocketIdentity } from "../../../infrastructure/websocket/types/websocket.types";
import { TRIP_WS_EVENTS } from "../constants/trip.constants";
import { LocationService } from "../services/location.service";

type AuthedSocket = Socket & {
  data: {
    user?: WebsocketIdentity;
  };
};

@WebSocketGateway({ namespace: "/" })
export class TripLocationGateway {
  constructor(@Inject(LocationService) private readonly locationService: LocationService) {}

  @SubscribeMessage(TRIP_WS_EVENTS.LOCATION)
  async onLocation(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() body: unknown,
  ): Promise<{ ok: true; payload: unknown } | { ok: false; error: string }> {
    const identity = client.data.user;
    if (!identity?.userId) {
      return { ok: false, error: "Unauthorized" };
    }

    try {
      const payload = await this.locationService.publish(identity, body);
      return { ok: true, payload };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Location rejected";
      return { ok: false, error: message };
    }
  }
}
