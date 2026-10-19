import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../infrastructure/database/database.module";
import { WalletRepository } from "./repositories/wallet.repository";
import { WalletService } from "./services/wallet.service";

@Module({
  imports: [DatabaseModule],
  providers: [WalletRepository, WalletService],
  exports: [WalletService],
})
export class WalletModule {}
