import { Injectable, type OnApplicationShutdown } from "@nestjs/common";
import type { ConfigurableSocketIoAdapter } from "./websocket.adapter";

@Injectable()
export class SocketIoAdapterLifecycle implements OnApplicationShutdown {
  private adapter: ConfigurableSocketIoAdapter | null = null;

  register(adapter: ConfigurableSocketIoAdapter): void {
    this.adapter = adapter;
  }

  async onApplicationShutdown(): Promise<void> {
    const adapter = this.adapter;
    this.adapter = null;
    if (!adapter) {
      return;
    }

    await adapter.close();
  }
}
