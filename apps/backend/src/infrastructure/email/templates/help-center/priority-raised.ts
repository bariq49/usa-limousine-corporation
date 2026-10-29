import type { TicketPriorityMailProps } from "../../types/help-center";
import { emailParagraph } from "../shared/components/paragraph";
import { escapeHtml } from "../shared/html";
import { emailLayout } from "../shared/layout";
import { contactDetails, messageCard, urgentBanner } from "./components/ticket-card";

export function ticketPriorityRaised(props: TicketPriorityMailProps) {
  const { siteUrl, ticket } = props;

  return emailLayout({
    siteUrl,
    title: "High Priority Ticket",
    subtitle: ticket.ticketNumber,
    preheader: `${ticket.ticketNumber} was marked high priority.`,
    body: `
      ${urgentBanner()}
      ${emailParagraph(`Ticket ${escapeHtml(ticket.ticketNumber)} was marked high priority.`, { strong: true })}
      ${contactDetails(ticket)}
      ${messageCard({ label: ticket.subject, content: ticket.description })}
    `,
  });
}
