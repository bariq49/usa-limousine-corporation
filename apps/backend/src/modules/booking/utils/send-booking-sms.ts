import type { AppLogger } from "../../../common/logger/app.logger";
import { formatDate } from "../../../common/utils/format-date";
import { formatTime } from "../../../common/utils/format-time";
import type { TwilioService } from "../../../infrastructure/twilio/twilio.service";
import type { BookingRepository } from "../repositories/booking.repository";
import type { PassengerInput, SmsBooking, TimeInput } from "../types/booking";

type Props = {
  bookingId: string;
  kind: string;
  text: (booking: SmsBooking) => string;
  bookingRepository: BookingRepository;
  twilio: TwilioService;
  logger: AppLogger;
  context: string;
};

export async function sendBookingSms(props: Props) {
  if (!props.twilio.isConfigured()) return;

  try {
    const row = await props.bookingRepository.findById(props.bookingId);
    const phone = row ? (row.passenger as PassengerInput).phone : null;
    if (!row || !phone) return;

    if (props.kind !== "cancelled" && !row.notifyBySms) return;

    const time = row.bookingTime as TimeInput;
    await props.twilio.send({
      to: phone,
      body: props.text({
        bookingNumber: row.bookingNumber,
        pickup: `${formatDate({ date: time.pickupDate })} at ${formatTime({ date: time.pickupTime })}`,
        total: row.totalPrice.toFixed(2),
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    props.logger.error(
      `Booking ${props.kind} SMS failed for ${props.bookingId}: ${message}`,
      undefined,
      props.context,
    );
  }
}
