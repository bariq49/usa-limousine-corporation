import { Inject, Injectable } from "@nestjs/common";
import { PLATFORM } from "@usa-limousine-corporation/config";
import { AppLogger } from "../../../common/logger/app.logger";
import { formatDate } from "../../../common/utils/format-date";
import { formatTime } from "../../../common/utils/format-time";
import { TwilioService } from "../../../infrastructure/twilio/twilio.service";
import type { DriverAssignmentSms } from "../types/driver";

@Injectable()
export class DriverSmsService {
  constructor(
    @Inject(TwilioService) private readonly twilio: TwilioService,
    @Inject(AppLogger) private readonly logger: AppLogger,
  ) {}

  async sendAssigned(input: DriverAssignmentSms) {
    if (!this.twilio.isConfigured()) return;

    try {
      await this.twilio.send({
        to: input.to,
        body:
          `${PLATFORM.name}: ride ${input.bookingNumber} has been assigned to you. ` +
          `Pickup: ${formatDate({ date: input.pickupDate })} at ` +
          `${formatTime({ date: input.pickupTime })}, ${input.pickupAddress}.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(
        `Driver assignment SMS failed for ${input.bookingNumber}: ${message}`,
        undefined,
        DriverSmsService.name,
      );
    }
  }
}
