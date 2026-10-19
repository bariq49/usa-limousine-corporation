import type { ApplicationStatus } from "../types/application-status";
import { escapeHtml, layout } from "./layout";

export function applicationStatus({ status, reason }: ApplicationStatus): string {
  if (status === "UNDER_REVIEW") {
    return layout({
      preheader: "Your driver application is under review.",
      title: "Your application is under review",
      content: `
        <p style="margin:0;font-size:16px;line-height:1.7;color:#374151;">
          Your USA Limousine Corporation driver application is now under review. Our team will verify your
          submitted details and documents, then notify you of the outcome.
        </p>`,
    });
  }

  if (status === "APPROVED") {
    return layout({
      preheader: "Your driver application has been approved.",
      title: "Your application is approved",
      content: `
        <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#374151;">
          Congratulations — your USA Limousine Corporation driver application has been approved.
        </p>
        <p style="margin:0;font-size:16px;line-height:1.7;color:#374151;">
          A separate email contains your login credentials. Use them to sign in.
        </p>`,
    });
  }

  return layout({
    preheader: "Your driver application requires attention.",
    title: "Your application was rejected",
    content: `
      <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#374151;">
        Your USA Limousine Corporation driver application was not approved at this time.
      </p>
      <p style="margin:0;font-size:16px;line-height:1.7;color:#374151;">
        <strong>Reason:</strong> ${escapeHtml(reason ?? "No reason provided.")}
      </p>`,
  });
}
