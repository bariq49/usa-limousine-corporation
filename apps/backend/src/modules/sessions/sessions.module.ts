import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../infrastructure/database/database.module";
import { WebsocketCoreModule } from "../../infrastructure/websocket/websocket-core.module";
import { SessionsController } from "./controllers/sessions.controller";
import { SessionsRepository } from "./repositories/sessions.repository";
import { SessionsService } from "./services/sessions.service";

@Module({
  imports: [DatabaseModule, WebsocketCoreModule],
  providers: [SessionsRepository, SessionsService],
  controllers: [SessionsController],
  exports: [SessionsService],
})
export class SessionsModule {}
