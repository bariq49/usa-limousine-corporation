import { Injectable } from "@nestjs/common";
import { sessionRoom, userRoom } from "./constants/rooms";
import type { WebsocketIdentity } from "./types/websocket.types";

@Injectable()
export class WebsocketRoomsService {
  /** Every socket joins its user room (notifications) and its session room (revocation). */
  async forIdentity(identity: WebsocketIdentity): Promise<string[]> {
    return [userRoom(identity.userId), sessionRoom(identity.sessionId)];
  }
}
