import { Controller, Get, Inject } from "@nestjs/common";
import { ExtraServiceService } from "../services/extra-service.service";

@Controller("public/extra-services")
export class PublicController {
  constructor(
    @Inject(ExtraServiceService)
    private readonly service: ExtraServiceService,
  ) {}

  @Get()
  findActive() {
    return this.service.findActive();
  }
}
