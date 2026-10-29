import type { BookingMailProps } from "../../types/booking";
import { emailParagraph } from "../shared/components/paragraph";
import { escapeHtml } from "../shared/html";
import { emailLayout } from "../shared/layout";
import { bookingSummary } from "./components/cards";
import { helpLine } from "./components/help-line";

export function bookingReceived(props: BookingMailProps) {
  const { booking, siteUrl } = props;
  return emailLayout({
    siteUrl,
    title: "Booking Received",
    subtitle: booking.bookingNumber,
    preheader: `Booking request received · ${booking.bookingNumber}. We will confirm it shortly.`,
    body: `
      ${emailParagraph(`Thank you, ${escapeHtml(booking.passenger.name)}.`, { strong: true })}
      ${emailParagraph(
        "We have received your booking request. Our team will review it and send you a confirmation shortly. Your ride details are below.",
      )}
      ${bookingSummary(booking)}
      ${helpLine}
    `,
  });
}
