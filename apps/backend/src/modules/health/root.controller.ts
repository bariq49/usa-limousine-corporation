import { Controller, Get, VERSION_NEUTRAL } from "@nestjs/common";
import { API_PREFIX, API_VERSION, APP_NAME } from "../../config/api.constants";

@Controller({ version: VERSION_NEUTRAL })
export class RootController {
  @Get()
  getRoot() {
    return {
      name: APP_NAME,
      message:
        "HTTP API is under /api/v1. Realtime uses Socket.IO on this same host (path /socket.io), not a plain GET /.",
      apiBasePath: `/${API_PREFIX}/v${API_VERSION}`,
      health: `/${API_PREFIX}/v${API_VERSION}/health`,
      socketIo: {
        path: "/socket.io",
        namespace: "/",
        postman: "New → Socket.IO → Connect (do not use Send on an HTTP request)",
      },
    };
  }
}
