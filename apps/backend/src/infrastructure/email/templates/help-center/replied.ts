import type { TicketRepliedMailProps } from "../../types/help-center";
import { emailParagraph } from "../shared/components/paragraph";
import { escapeHtml } from "../shared/html";
import { emailLayout } from "../shared/layout";
import { messageCard, replyHint } from "./components/ticket-card";

export function ticketReplied(props: TicketRepliedMailProps) {
  const { siteUrl, ticket, reply } = props;

  return emailLayout({
    siteUrl,
    title: "New Reply From Our Team",
    subtitle: ticket.ticketNumber,
    preheader: `Our team replied to ${ticket.ticketNumber}.`,
    body: `
      ${emailParagraph(`Hello, ${escapeHtml(ticket.contactName)}.`, { strong: true })}
      ${emailParagraph(`Our team replied to your request <strong>${escapeHtml(ticket.subject)}</strong>.`)}
      ${messageCard({ label: "Our reply", content: reply })}
      ${replyHint()}
    `,
  });
}
