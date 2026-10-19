import { Module, forwardRef } from "@nestjs/common";
import { DatabaseModule } from "../../infrastructure/database/database.module";
import { AuthModule } from "../auth/auth.module";
import { NotificationModule } from "../notification/notification.module";
import { PaymentModule } from "../payment/payment.module";
import { PlanController } from "./controllers/plan.controller";
import { SubscriptionBillingQueueService } from "./jobs/billing-queue.service";
import { PlanRepository } from "./repositories/plan.repository";
import { SubscriptionRepository } from "./repositories/subscription.repository";
import { SubscriptionCheckoutRegistrar } from "./services/checkout.registrar";
import { PlanService } from "./services/plan.service";
import { SubscriptionService } from "./services/subscription.service";
import { SubscriptionPaymentListener } from "./listeners/payment.listener";
import { SubscriptionTrialSetupListener } from "./listeners/trial-setup.listener";

@Module({
  imports: [DatabaseModule, AuthModule, NotificationModule, forwardRef(() => PaymentModule)],
  controllers: [PlanController],
  providers: [
    PlanRepository,
    SubscriptionRepository,
    PlanService,
    SubscriptionService,
    SubscriptionCheckoutRegistrar,
    SubscriptionBillingQueueService,
    SubscriptionPaymentListener,
    SubscriptionTrialSetupListener,
  ],
  exports: [PlanService, PlanRepository, SubscriptionService, SubscriptionRepository],
})
export class SubscriptionModule {}
