import { Module } from "@nestjs/common";
import { EmailService } from "./email.service";
import { emailProviderRegistration } from "./providers/email.provider.registration";

@Module({
  providers: [emailProviderRegistration, EmailService],
  exports: [EmailService],
})
export class EmailModule {}
