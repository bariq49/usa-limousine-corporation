import { Module, forwardRef } from "@nestjs/common";
import { LoggerModule } from "../../common/logger/logger.module";
import { DatabaseModule } from "../../infrastructure/database/database.module";
import { StripeModule } from "../../infrastructure/stripe/stripe.module";
import { AuthModule } from "../auth/auth.module";
import { PaymentController } from "./controllers/payment.controller";
import { PublicController } from "./controllers/public.controller";
import { WebhookController } from "./controllers/webhook.controller";
import { EventsQueueService } from "./jobs/events-queue.service";
import { OutboxRepository } from "./repositories/outbox.repository";
import { PaymentRepository } from "./repositories/payment.repository";
import { WebhookRepository } from "./repositories/webhook.repository";
import { CheckoutService } from "./services/checkout.service";
import { ChargeService } from "./services/charge.service";
import { OutboxService } from "./services/outbox.service";
import { PaymentMethodService } from "./services/payment-method.service";
import { PaymentService } from "./services/payment.service";
import { RefundService } from "./services/refund.service";
import { ValidatorRegistry } from "./services/validator.registry";
import { WebhookService } from "./services/webhook.service";

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule), StripeModule, LoggerModule],
  controllers: [PublicController, WebhookController, PaymentController],
  providers: [
    PaymentRepository,
    WebhookRepository,
    OutboxRepository,
    OutboxService,
    PaymentService,
    CheckoutService,
    ChargeService,
    PaymentMethodService,
    ValidatorRegistry,
    RefundService,
    WebhookService,
    EventsQueueService,
  ],
  exports: [
    PaymentService,
    CheckoutService,
    ChargeService,
    PaymentMethodService,
    PaymentRepository,
    RefundService,
    ValidatorRegistry,
    OutboxService,
    EventsQueueService,
  ],
})
export class PaymentModule {}
