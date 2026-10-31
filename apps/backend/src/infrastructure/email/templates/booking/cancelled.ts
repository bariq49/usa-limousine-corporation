import type { BookingCancelMailProps } from "../../types/booking";
import { emailParagraph } from "../shared/components/paragraph";
import { escapeHtml } from "../shared/html";
import { emailLayout } from "../shared/layout";
import { bookingSummary } from "./components/cards";
import { helpLine } from "./components/help-line";

export function bookingCancelled(props: BookingCancelMailProps) {
  const { booking, siteUrl, reason, admin = false, byCustomer = false } = props;

  if (admin) {
    return emailLayout({
      siteUrl,
      title: "Booking Cancelled",
      subtitle: `Cancelled by customer · ${booking.bookingNumber}`,
      preheader: `${booking.passenger.name} cancelled ${booking.bookingNumber}.`,
      body: `
        ${emailParagraph(`Booking ${escapeHtml(booking.bookingNumber)} was cancelled by ${escapeHtml(booking.passenger.name)}.`, { strong: true })}
        ${emailParagraph(reason ? `Reason: ${escapeHtml(reason)}` : "No reason was given.")}
        ${bookingSummary(booking)}
      `,
    });
  }

  const message = byCustomer
    ? `Your booking ${escapeHtml(booking.bookingNumber)} has been cancelled.`
    : `USA Limousine Corporation has cancelled your booking ${escapeHtml(booking.bookingNumber)}.`;

  return emailLayout({
    siteUrl,
    title: "Booking Cancelled",
    subtitle: booking.bookingNumber,
    preheader: `Booking cancelled · ${booking.bookingNumber}.`,
    body: `
      ${emailParagraph(`Hello, ${escapeHtml(booking.passenger.name)}.`, { strong: true })}
      ${emailParagraph(message)}
      ${reason ? emailParagraph(`Reason: ${escapeHtml(reason)}`) : ""}
      ${bookingSummary(booking)}
      ${helpLine}
    `,
  });
}
