import type { Credentials } from "../types/credentials";
import { escapeHtml, layout } from "./layout";

export function credentials({ email, password }: Credentials): string {
  const safeEmail = escapeHtml(email);
  const safePassword = escapeHtml(password);

  return layout({
    preheader:
      "Your USA Limousine Corporation driver account is ready. Sign in with the credentials below.",
    title: "Your driver account is approved",
    content: `
      <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#374151;">
        Congratulations — your USA Limousine Corporation driver application has been approved. Use the login
        credentials below to sign in.
      </p>
      <div style="margin:28px 0;padding:20px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;">
        <div style="margin-bottom:16px;">
          <div style="margin-bottom:6px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#6b7280;">
            Email
          </div>
          <div style="font-size:16px;font-weight:600;color:#111827;word-break:break-all;">
            ${safeEmail}
          </div>
        </div>
        <div>
          <div style="margin-bottom:6px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#6b7280;">
            Password
          </div>
          <div style="font-family:'Courier New',monospace;font-size:18px;font-weight:700;letter-spacing:1px;color:#111827;word-break:break-all;">
            ${safePassword}
          </div>
        </div>
      </div>
      <p style="margin:0;font-size:14px;line-height:1.7;color:#6b7280;">
        For your security, change this password after you sign in.
      </p>`,
  });
}
