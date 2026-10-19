import { Global, Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { StripeService } from "./stripe.service";

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
