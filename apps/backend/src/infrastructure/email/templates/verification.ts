import type { Verification } from "../types/verification";
import { escapeHtml, layout } from "./layout";

export function verification({ token, expiresInMinutes = 24 * 60 }: Verification): string {
  const safeToken = escapeHtml(token);
  const expiryLabel =
    expiresInMinutes >= 60
      ? `${Math.round(expiresInMinutes / 60)} hour${expiresInMinutes >= 120 ? "s" : ""}`
      : `${expiresInMinutes} minutes`;

  return layout({
    preheader:
      "Use your verification code to finish setting up your USA Limousine Corporation account.",
    title: "Verify your email address",
    content: `
      <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#374151;">
        Welcome to USA Limousine Corporation. Enter the verification code below to finish setting up your account.
      </p>
      <div style="margin:28px 0;padding:20px;text-align:center;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;">
        <div style="margin-bottom:8px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#6b7280;">
          Verification code
        </div>
        <div style="font-family:'Courier New',monospace;font-size:24px;font-weight:700;letter-spacing:2px;color:#111827;word-break:break-all;">
          ${safeToken}
        </div>
      </div>
      <p style="margin:0;font-size:14px;line-height:1.7;color:#6b7280;">
        This code expires in ${expiryLabel}. For your security, do not share it with anyone.
      </p>`,
  });
}
