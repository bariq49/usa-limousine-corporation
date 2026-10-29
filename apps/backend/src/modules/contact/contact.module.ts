import { Module } from "@nestjs/common";
import { HelpCenterModule } from "../help-center/help-center.module";
import { ContactController } from "./controllers/contact.controller";
import { ContactService } from "./services/contact.service";

@Module({
  imports: [HelpCenterModule],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}
