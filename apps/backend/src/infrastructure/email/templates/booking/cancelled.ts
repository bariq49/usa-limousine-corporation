import type { BookingCancelMailProps } from "../../types/booking";
import { emailParagraph } from "../shared/components/paragraph";
import { escapeHtml } from "../shared/html";
import { emailLayout } from "../shared/layout";
import { bookingSummary, formatPrice } from "./components/cards";
import { helpLine } from "./components/help-line";
import { refundParagraph } from "./components/refund";

export function bookingCancelled(props: BookingCancelMailProps) {
  const { booking, siteUrl, reason, refundAmount, admin = false } = props;

  if (admin) {
    return emailLayout({
      siteUrl,
      title: "Booking Cancelled",
      subtitle: `Cancelled by customer · ${booking.bookingNumber}`,
      preheader: `${booking.passenger.name} cancelled ${booking.bookingNumber}.`,
      body: `
        ${emailParagraph(`Booking ${escapeHtml(booking.bookingNumber)} was cancelled by the customer.`, { strong: true })}
        ${emailParagraph(reason ? `Reason: ${escapeHtml(reason)}` : "No reason was given.")}
        ${emailParagraph(
          refundAmount > 0
            ? `${escapeHtml(formatPrice(refundAmount))} was refunded to the customer's card automatically.`
            : "No refund was issued.",
        )}
        ${bookingSummary(booking)}
      `,
    });
  }

  return emailLayout({
    siteUrl,
    title: "Booking Cancelled",
    subtitle: booking.bookingNumber,
    preheader: `Booking cancelled · ${booking.bookingNumber}.`,
    body: `
      ${emailParagraph(`Hello, ${escapeHtml(booking.passenger.name)}.`, { strong: true })}
      ${emailParagraph(`Your booking ${escapeHtml(booking.bookingNumber)} has been cancelled.`)}
      ${reason ? emailParagraph(`Reason: ${escapeHtml(reason)}`) : ""}
      ${refundParagraph(refundAmount)}
      ${bookingSummary(booking)}
      ${helpLine}
    `,
  });
}
