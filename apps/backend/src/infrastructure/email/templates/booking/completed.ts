import type { BookingMailProps } from "../../types/booking";
import { emailParagraph } from "../shared/components/paragraph";
import { escapeHtml } from "../shared/html";
import { emailLayout } from "../shared/layout";
import { bookingSummary, googleReviewCard } from "./components/cards";

export function bookingCompleted(props: BookingMailProps) {
  const { booking, siteUrl, reviewUrl } = props;
  return emailLayout({
    siteUrl,
    title: "Ride Completed",
    subtitle: booking.bookingNumber,
    preheader: `Thank you for riding with us · ${booking.bookingNumber}.`,
    body: `
      ${emailParagraph(`Hello, ${escapeHtml(booking.passenger.name)}.`, { strong: true })}
      ${emailParagraph(`Your trip ${escapeHtml(booking.bookingNumber)} is complete. We hope you enjoyed the ride.`)}
      ${reviewUrl ? googleReviewCard(reviewUrl) : ""}
      ${bookingSummary(booking)}
    `,
  });
}
