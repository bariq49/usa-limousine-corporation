import type { TicketAdminMailProps, TicketReceivedMailProps } from "../../types/help-center";
import { emailParagraph } from "../shared/components/paragraph";
import { escapeHtml } from "../shared/html";
import { emailLayout } from "../shared/layout";
import { contactDetails, messageCard, replyHint, urgentBanner } from "./components/ticket-card";

export function ticketCreatedUser(props: TicketReceivedMailProps) {
  const { siteUrl, ticket } = props;

  return emailLayout({
    siteUrl,
    title: "We Received Your Message",
    subtitle: ticket.ticketNumber,
    preheader: `Thanks for contacting us. Your reference is ${ticket.ticketNumber}.`,
    body: `
      ${emailParagraph(`Thank you, ${escapeHtml(ticket.contactName)}.`, { strong: true })}
      ${emailParagraph(
        `Our team has received your message and will get back to you shortly. Your reference number is <strong>${escapeHtml(ticket.ticketNumber)}</strong>.`,
      )}
      ${messageCard({ label: ticket.subject, content: ticket.description })}
      ${replyHint()}
    `,
  });
}

export function ticketCreatedAdmin(props: TicketAdminMailProps) {
  const { siteUrl, ticket, source } = props;
  const isHigh = ticket.priority === "HIGH";

  return emailLayout({
    siteUrl,
    title: isHigh ? "High Priority Ticket" : "New Support Ticket",
    subtitle: ticket.ticketNumber,
    preheader: `${ticket.contactName}: ${ticket.subject}`,
    body: `
      ${isHigh ? urgentBanner() : ""}
      ${emailParagraph(
        source === "website"
          ? `${escapeHtml(ticket.contactName)} sent a message from the website contact form.`
          : `${escapeHtml(ticket.contactName)} opened a ticket from the customer portal.`,
        { strong: true },
      )}
      ${contactDetails(ticket)}
      ${messageCard({ label: ticket.subject, content: ticket.description })}
    `,
  });
}
