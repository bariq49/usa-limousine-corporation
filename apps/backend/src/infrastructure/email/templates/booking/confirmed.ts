import type { BookingMailProps } from "../../types/booking";
import { emailParagraph } from "../shared/components/paragraph";
import { escapeHtml } from "../shared/html";
import { emailLayout } from "../shared/layout";
import { bookingSummary } from "./components/cards";
import { helpLine } from "./components/help-line";

export function bookingConfirmed(props: BookingMailProps) {
  const { booking, siteUrl, paid = false, admin = false } = props;

  if (admin) {
    return emailLayout({
      siteUrl,
      title: paid ? "New Paid Booking" : "New Booking",
      subtitle: booking.bookingNumber,
      preheader: `New booking ${booking.bookingNumber} from ${booking.passenger.name}`,
      body: `
        ${emailParagraph(`New booking request · ${escapeHtml(booking.bookingNumber)}.`, { strong: true })}
        ${emailParagraph(
          paid
            ? `${escapeHtml(booking.passenger.name)} has booked and paid online. The booking is confirmed.`
            : `${escapeHtml(booking.passenger.name)} has requested a ride. Review and confirm it from the admin dashboard.`,
        )}
        ${bookingSummary(booking)}
      `,
    });
  }

  return emailLayout({
    siteUrl,
    title: "Booking Confirmed",
    subtitle: booking.bookingNumber,
    preheader: `Booking confirmed · ${booking.bookingNumber}. Your ride is reserved.`,
    body: `
      ${emailParagraph(`Good news, ${escapeHtml(booking.passenger.name)}.`, { strong: true })}
      ${emailParagraph(
        paid
          ? "We have received your payment. Your booking is confirmed and your chauffeur is reserved. Your ride details and receipt are below."
          : "Your booking is confirmed and your chauffeur is reserved. Your ride details are below.",
      )}
      ${bookingSummary(booking)}
      ${helpLine}
    `,
  });
}
