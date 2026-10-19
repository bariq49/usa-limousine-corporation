import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../infrastructure/database/database.module";
import { SequenceModule } from "../../infrastructure/sequence/sequence.module";
import { AuthModule } from "../auth/auth.module";
import { NotificationModule } from "../notification/notification.module";
import { SettingsModule } from "../settings/settings.module";
import { WalletModule } from "../wallet/wallet.module";
import { PayoutController } from "./controllers/payout.controller";
import { PayoutQueueService } from "./jobs/payout-queue.service";
import { PayoutRepository } from "./repositories/payout.repository";
import { PayoutBankResolver } from "./services/payout-bank.resolver";
import { PayoutService } from "./services/payout.service";

@Module({
  imports: [
    DatabaseModule,
    SequenceModule,
    AuthModule,
    WalletModule,
    NotificationModule,
    SettingsModule,
  ],
  controllers: [PayoutController],
  providers: [PayoutRepository, PayoutBankResolver, PayoutService, PayoutQueueService],
  exports: [PayoutService, PayoutRepository],
})
export class PayoutModule {}
