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
      <p style="margin:0 0 12px;font-size:16px;line-height:1.7;color:#475569;">
        Welcome to USA Limousine Corporation.
      </p>
      <p style="margin:0;font-size:16px;line-height:1.7;color:#475569;">
        Use the secure code below to confirm your email address and finish setting up your account.
      </p>
      <div style="margin:30px 0;padding:24px;text-align:center;background:#fcfaf3;border:1px solid #e7dcc0;border-radius:12px;">
        <div style="margin-bottom:10px;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#9a7a2d;">
          Your verification code
        </div>
        <div style="font-family:'Courier New',Courier,monospace;font-size:32px;font-weight:700;letter-spacing:7px;color:#111827;word-break:break-all;">
          ${safeToken}
        </div>
      </div>
      <p style="margin:0;font-size:14px;line-height:1.7;color:#64748b;">
        This code expires in ${expiryLabel}. For your security, do not share it with anyone.
      </p>`,
  });
}
