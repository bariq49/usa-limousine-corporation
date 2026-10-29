import type { DriverAssignedMailProps } from "../../types/booking";
import { emailParagraph } from "../shared/components/paragraph";
import { escapeHtml } from "../shared/html";
import { emailLayout } from "../shared/layout";
import {
  formatPrice,
  infoCard,
  passengerCard,
  routeCard,
  tripDetailsCard,
  vehicleCard,
} from "./components/cards";
import { helpLine } from "./components/help-line";

export function driverAssigned(props: DriverAssignedMailProps) {
  const { booking, siteUrl, assignment } = props;
  return emailLayout({
    siteUrl,
    title: "New Ride Assigned",
    subtitle: booking.bookingNumber,
    preheader: `You have been assigned ride ${booking.bookingNumber}.`,
    body: `
      ${emailParagraph(`Hello, ${escapeHtml(assignment.driverName)}.`, { strong: true })}
      ${emailParagraph(
        "A new ride has been assigned to you. Please review the trip details below and be on time for the pickup.",
      )}
      ${infoCard(
        "Your Payout",
        `${emailParagraph(escapeHtml(formatPrice(assignment.driverAmount)), { strong: true })}${
          assignment.note ? emailParagraph(`Dispatcher note: ${escapeHtml(assignment.note)}`) : ""
        }`,
      )}
      ${routeCard(booking)}
      ${tripDetailsCard(booking)}
      ${passengerCard(booking)}
      ${vehicleCard(booking)}
      ${helpLine}
    `,
  });
}
