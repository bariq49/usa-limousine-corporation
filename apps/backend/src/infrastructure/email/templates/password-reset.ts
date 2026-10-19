import type { PasswordReset } from "../types/password-reset";
import { escapeHtml, layout } from "./layout";

export function passwordReset({ token, expiresInMinutes = 10 }: PasswordReset): string {
  const safeToken = escapeHtml(token);

  return layout({
    preheader: "Use this verification code to reset your USA Limousine Corporation password.",
    title: "Reset your password",
    content: `
      <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#374151;">
        We received a request to reset your USA Limousine Corporation password. Enter the verification code below in the app to continue.
      </p>
      <div style="margin:28px 0;padding:20px;text-align:center;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;">
        <div style="margin-bottom:8px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#6b7280;">
          Password reset code
        </div>
        <div style="font-family:'Courier New',monospace;font-size:32px;font-weight:700;letter-spacing:6px;color:#111827;">
          ${safeToken}
        </div>
      </div>
      <p style="margin:0;font-size:14px;line-height:1.7;color:#6b7280;">
        This code expires in ${expiresInMinutes} minutes and can only be used once. USA Limousine Corporation will never ask you to share it.
      </p>`,
  });
}
