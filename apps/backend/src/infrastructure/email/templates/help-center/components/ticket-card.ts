import type { TicketMailView } from "../../../types/help-center";
import { EMAIL_BRAND } from "../../shared/brand";
import { emailParagraph } from "../../shared/components/paragraph";
import { escapeHtml } from "../../shared/html";

export function messageCard(props: { label: string; content: string }) {
  const { label, content } = props;
  return `
    <div style="padding:20px;background:${EMAIL_BRAND.soft};border-radius:4px;margin:0 0 20px;">
      <p style="margin:0;font-size:12px;line-height:1.5;letter-spacing:0.04em;text-transform:uppercase;color:${EMAIL_BRAND.muted};font-weight:600;">
        ${escapeHtml(label)}
      </p>
      <p style="margin:12px 0 0;font-size:16px;line-height:1.6;color:${EMAIL_BRAND.text};white-space:pre-wrap;">${escapeHtml(content)}</p>
    </div>
  `;
}

function detailRow(label: string, value: string) {
  return `
    <tr>
      <td style="padding:6px 0;width:110px;vertical-align:top;font-size:14px;color:${EMAIL_BRAND.muted};">${escapeHtml(label)}</td>
      <td style="padding:6px 0;font-size:14px;color:${EMAIL_BRAND.text};font-weight:600;">${value}</td>
    </tr>
  `;
}

export function contactDetails(ticket: TicketMailView) {
  const email = escapeHtml(ticket.contactEmail);
  const phone = ticket.contactPhone ? escapeHtml(ticket.contactPhone) : null;
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 20px;border-collapse:collapse;">
      ${detailRow("Name", escapeHtml(ticket.contactName))}
      ${detailRow("Email", `<a href="mailto:${email}" style="color:${EMAIL_BRAND.text};">${email}</a>`)}
      ${phone ? detailRow("Phone", `<a href="tel:${phone}" style="color:${EMAIL_BRAND.text};">${phone}</a>`) : ""}
      ${detailRow("Topic", escapeHtml(ticket.category))}
      ${detailRow("Priority", escapeHtml(ticket.priority))}
    </table>
  `;
}

export function urgentBanner() {
  return `
    <div style="padding:14px 18px;background:#fef2f2;border:1px solid #fecaca;border-radius:4px;margin:0 0 20px;">
      <p style="margin:0;font-size:15px;line-height:1.5;color:#b91c1c;font-weight:700;">High priority: please respond as soon as possible.</p>
    </div>
  `;
}

export function replyHint(text = "Reply to this email if you have anything to add.") {
  return emailParagraph(escapeHtml(text), { muted: true });
}
