import { Inject, Injectable } from "@nestjs/common";
import { PLATFORM } from "@usa-limousine-corporation/config";
import { AppLogger } from "../../../common/logger/app.logger";
import { EmailService } from "../../../infrastructure/email/email.service";
import { driverAssigned } from "../../../infrastructure/email/templates/booking/driver-assigned";
import type { DriverAssignmentEmail } from "../types/driver";

@Injectable()
export class DriverEmailService {
  constructor(
    @Inject(EmailService) private readonly email: EmailService,
    @Inject(AppLogger) private readonly logger: AppLogger,
  ) {}

  async sendAssigned(input: DriverAssignmentEmail) {
    try {
      await this.email.send({
        to: input.to,
        subject: `New ride assigned · ${input.booking.bookingNumber} - ${PLATFORM.shortName}`,
        html: driverAssigned({
          booking: input.booking,
          assignment: input.assignment,
        }),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(
        `Driver assignment email failed for ${input.booking.bookingNumber}: ${message}`,
        undefined,
        DriverEmailService.name,
      );
    }
  }
}
