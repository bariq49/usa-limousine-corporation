import { Controller, Get, Inject } from "@nestjs/common";
import { PlatformSettingsService } from "../services/platform-settings.service";

@Controller("public/settings")
export class PublicController {
  constructor(
    @Inject(PlatformSettingsService)
    private readonly service: PlatformSettingsService,
  ) {}

  /** Fees and booking rules the website needs to quote a trip. */
  @Get()
  get() {
    return this.service.get();
  }
}
