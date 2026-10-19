import type { ApplicationReceived } from "../types/application-received";
import { escapeHtml, layout } from "./layout";

type Details = Omit<ApplicationReceived, "to">;

function detailRow(label: string, value?: string | null) {
  if (!value) {
    return "";
  }

  return `
    <tr>
      <td style="padding:6px 0;font-size:14px;line-height:1.6;color:#6b7280;width:160px;vertical-align:top;">
        ${escapeHtml(label)}
      </td>
      <td style="padding:6px 0;font-size:14px;line-height:1.6;color:#111827;vertical-align:top;">
        ${escapeHtml(value)}
      </td>
    </tr>`;
}

function detailsTable(details: Details) {
  const shiftHours =
    details.shift && details.shift !== "FLEXIBLE" && details.startTime && details.endTime
      ? `${details.shift} (${details.startTime} – ${details.endTime})`
      : details.shift;

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:20px 0 0;">
      ${detailRow("Application", details.applicationNumber)}
      ${detailRow("Name", `${details.firstName} ${details.lastName}`.trim())}
      ${detailRow("Email", details.email)}
      ${detailRow("Phone", details.phone)}
      ${detailRow("Home address", details.homeAddress)}
      ${detailRow("Shift", shiftHours)}
      ${detailRow("Operating country", details.operatingCountry)}
      ${detailRow("Operating city", details.operatingCity)}
      ${detailRow("Vehicle", details.vehicleSummary)}
    </table>`;
}

export function applicationReceived(details: Details): string {
  return layout({
    preheader: "We received your USA Limousine Corporation driver application.",
    title: "Your application has been received",
    content: `
      <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#374151;">
        Hi ${escapeHtml(details.firstName)}, thank you for applying to drive with USA Limousine Corporation.
        We have received your application
        <strong>${escapeHtml(details.applicationNumber)}</strong>.
      </p>
      <p style="margin:0;font-size:16px;line-height:1.7;color:#374151;">
        Our team will review your details and documents and email you once there is an update.
      </p>`,
  });
}

export function adminApplicationReceived(details: Details): string {
  return layout({
    preheader: `New driver application ${details.applicationNumber}.`,
    title: "New driver application received",
    content: `
      <p style="margin:0;font-size:16px;line-height:1.7;color:#374151;">
        A new driver application has been submitted and is ready for review.
      </p>
      ${detailsTable(details)}`,
  });
}
