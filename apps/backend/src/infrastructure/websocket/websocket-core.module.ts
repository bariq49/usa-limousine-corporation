import { Global, Module } from "@nestjs/common";
import { SocketIoAdapterLifecycle } from "./socket-io-adapter.lifecycle";
import { WebsocketService } from "./websocket.service";

/** Lightweight export of WebsocketService (no gateway). Safe for workers. */
@Global()
@Module({
  providers: [WebsocketService, SocketIoAdapterLifecycle],
  exports: [WebsocketService, SocketIoAdapterLifecycle],
})
export class WebsocketCoreModule {}
