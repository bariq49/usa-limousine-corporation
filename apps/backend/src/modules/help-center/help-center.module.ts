import { Module, forwardRef } from "@nestjs/common";
import { DatabaseModule } from "../../infrastructure/database/database.module";
import { SequenceModule } from "../../infrastructure/sequence/sequence.module";
import { ActivityModule } from "../activity/activity.module";
import { AuthModule } from "../auth/auth.module";
import { NotificationModule } from "../notification/notification.module";
import { TicketController } from "./controllers/ticket.controller";
import { TicketActivityListener } from "./listeners/ticket-activity.listener";
import { TicketRepository } from "./repositories/ticket.repository";
import { TicketService } from "./services/ticket.service";

@Module({
  imports: [
    DatabaseModule,
    SequenceModule,
    ActivityModule,
    NotificationModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [TicketController],
  providers: [TicketRepository, TicketService, TicketActivityListener],
  exports: [TicketService, TicketRepository],
})
export class HelpCenterModule {}
