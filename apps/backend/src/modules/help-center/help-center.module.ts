import { Module, forwardRef } from "@nestjs/common";
import { DatabaseModule } from "../../infrastructure/database/database.module";
import { EmailModule } from "../../infrastructure/email/email.module";
import { SequenceModule } from "../../infrastructure/sequence/sequence.module";
import { ActivityModule } from "../activity/activity.module";
import { AuthModule } from "../auth/auth.module";
import { NotificationModule } from "../notification/notification.module";
import { TicketController } from "./controllers/ticket.controller";
import { TicketActivityListener } from "./listeners/ticket-activity.listener";
import { TicketRepository } from "./repositories/ticket.repository";
import { NotificationService } from "./services/notification.service";
import { TicketEmailQueueService } from "./jobs/ticket-email-queue.service";
import { TicketEmailService } from "./services/ticket-email.service";
import { TicketService } from "./services/ticket.service";

@Module({
  imports: [
    DatabaseModule,
    EmailModule,
    SequenceModule,
    ActivityModule,
    NotificationModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [TicketController],
  providers: [
    TicketRepository,
    TicketService,
    NotificationService,
    TicketActivityListener,
    TicketEmailService,
    TicketEmailQueueService,
  ],
  exports: [TicketService, TicketRepository, NotificationService],
})
export class HelpCenterModule {}
