import { escapeHtml } from "../../../infrastructure/email/templates/layout";
import { bookingSummary, formatPrice, googleReviewCard } from "./cards";
import { emailButton, emailLayout, emailParagraph } from "./layout";
import type { BookingEmail, EmailContext } from "./types";

const viewBookingButton = (booking: BookingEmail, context: EmailContext) =>
  booking.hasAccount
    ? emailButton(`${context.portalUrl}/bookings/${booking.id}`, "View booking")
    : "";

const refundParagraph = (amount: number) =>
  amount > 0
    ? emailParagraph(
        `A refund of ${escapeHtml(formatPrice(amount))} has been issued to your card. It can take 5-10 business days to appear on your statement.`,
      )
    : "";

const helpLine = emailParagraph("Need help? Reply to this email and our team will assist you.", {
  muted: true,
});

export const bookingReceived = (booking: BookingEmail, context: EmailContext) =>
  emailLayout({
    siteUrl: context.siteUrl,
    title: booking.vehicle.name,
    subtitle: booking.bookingNumber,
    preheader: `Booking request received · ${booking.bookingNumber}. We will confirm it shortly.`,
    headerImage: booking.vehicle.image,
    body: `
      ${emailParagraph(`Thank you, ${escapeHtml(booking.passenger.name)}.`, { strong: true })}
      ${emailParagraph(
        "We have received your booking request. Our team will review it and send you a confirmation shortly. Your ride details are below.",
      )}
      ${viewBookingButton(booking, context)}
      ${bookingSummary(booking, context.siteUrl)}
      ${helpLine}
    `,
  });

export const newBookingAdmin = (booking: BookingEmail, context: EmailContext, paid = false) =>
  emailLayout({
    siteUrl: context.siteUrl,
    title: booking.vehicle.name,
    subtitle: `New booking · ${booking.bookingNumber}`,
    preheader: `New booking ${booking.bookingNumber} from ${booking.passenger.name}`,
    headerImage: booking.vehicle.image,
    body: `
      ${emailParagraph(`New booking request · ${escapeHtml(booking.bookingNumber)}.`, { strong: true })}
      ${emailParagraph(
        paid
          ? `${escapeHtml(booking.passenger.name)} has booked and paid online. The booking is confirmed.`
          : `${escapeHtml(booking.passenger.name)} has requested a ride. Review and confirm it from the admin dashboard.`,
      )}
      ${bookingSummary(booking, context.siteUrl)}
    `,
  });

export const bookingConfirmed = (booking: BookingEmail, context: EmailContext, paid = false) =>
  emailLayout({
    siteUrl: context.siteUrl,
    title: booking.vehicle.name,
    subtitle: `Confirmed · ${booking.bookingNumber}`,
    preheader: `Booking confirmed · ${booking.bookingNumber}. Your ride is reserved.`,
    headerImage: booking.vehicle.image,
    body: `
      ${emailParagraph(`Good news, ${escapeHtml(booking.passenger.name)}.`, { strong: true })}
      ${emailParagraph(
        paid
          ? "We have received your payment. Your booking is confirmed and your chauffeur is reserved. Your ride details and receipt are below."
          : "Your booking is confirmed and your chauffeur is reserved. Your ride details are below.",
      )}
      ${viewBookingButton(booking, context)}
      ${bookingSummary(booking, context.siteUrl)}
      ${helpLine}
    `,
  });

export const bookingCancelled = (
  booking: BookingEmail,
  context: EmailContext,
  reason: string | null,
  refundAmount: number,
) =>
  emailLayout({
    siteUrl: context.siteUrl,
    title: "Booking Cancelled",
    subtitle: `${booking.vehicle.name} · ${booking.bookingNumber}`,
    preheader: `Booking cancelled · ${booking.bookingNumber}.`,
    headerImage: booking.vehicle.image,
    body: `
      ${emailParagraph(`Hello, ${escapeHtml(booking.passenger.name)}.`, { strong: true })}
      ${emailParagraph(`Your booking ${escapeHtml(booking.bookingNumber)} has been cancelled.`)}
      ${reason ? emailParagraph(`Reason: ${escapeHtml(reason)}`) : ""}
      ${refundParagraph(refundAmount)}
      ${bookingSummary(booking, context.siteUrl)}
      ${helpLine}
    `,
  });

export const bookingCancelledAdmin = (
  booking: BookingEmail,
  context: EmailContext,
  reason: string | null,
  refundAmount: number,
) =>
  emailLayout({
    siteUrl: context.siteUrl,
    title: "Booking Cancelled",
    subtitle: `Cancelled by customer · ${booking.bookingNumber}`,
    preheader: `${booking.passenger.name} cancelled ${booking.bookingNumber}.`,
    headerImage: booking.vehicle.image,
    body: `
      ${emailParagraph(`Booking ${escapeHtml(booking.bookingNumber)} was cancelled by the customer.`, { strong: true })}
      ${emailParagraph(reason ? `Reason: ${escapeHtml(reason)}` : "No reason was given.")}
      ${emailParagraph(
        refundAmount > 0
          ? `${escapeHtml(formatPrice(refundAmount))} was refunded to the customer's card automatically.`
          : "No refund was issued.",
      )}
      ${bookingSummary(booking, context.siteUrl)}
    `,
  });

export const bookingCompleted = (booking: BookingEmail, context: EmailContext) =>
  emailLayout({
    siteUrl: context.siteUrl,
    title: "Ride Completed",
    subtitle: `${booking.vehicle.name} · ${booking.bookingNumber}`,
    preheader: `Thank you for riding with us · ${booking.bookingNumber}.`,
    headerImage: booking.vehicle.image,
    body: `
      ${emailParagraph(`Hello, ${escapeHtml(booking.passenger.name)}.`, { strong: true })}
      ${emailParagraph(`Your trip ${escapeHtml(booking.bookingNumber)} is complete. We hope you enjoyed the ride.`)}
      ${context.reviewUrl ? googleReviewCard(context.reviewUrl) : ""}
      ${bookingSummary(booking, context.siteUrl)}
    `,
  });
