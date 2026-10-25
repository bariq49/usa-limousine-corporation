import { escapeHtml } from "../../../infrastructure/email/templates/layout";

export const EMAIL_BRAND = {
  name: "USA Limousine Corporation",
  accent: "#C9A84C",
  dark: "#111827",
  surface: "#ffffff",
  muted: "#6b7280",
  border: "#e5e7eb",
  background: "#f3f4f6",
  text: "#111827",
  soft: "#f9fafb",
  phone: "+1 732-289-8928",
  email: "info@usalimocorp.com",
} as const;

export type EmailLayout = {
  siteUrl: string;
  assetsUrl: string;
  title: string;
  subtitle?: string | undefined;
  preheader?: string | undefined;
  body: string;
};

export const emailLayout = ({
  siteUrl,
  assetsUrl,
  title,
  subtitle,
  preheader,
  body,
}: EmailLayout) => {
  const safeTitle = escapeHtml(title);
  const subtitleHtml = subtitle
    ? `<p style="margin:12px 0 0;"><span style="display:inline-block;padding:6px 14px;border:1px solid rgba(201,168,76,0.6);border-radius:999px;font-size:13px;line-height:1.4;letter-spacing:0.06em;color:${EMAIL_BRAND.accent};font-weight:600;">${escapeHtml(subtitle)}</span></p>`
    : "";
  const header = `<td style="padding:40px 24px 44px;background:${EMAIL_BRAND.dark};border-radius:0 0 6px 6px;text-align:center;">
        <img src="${escapeHtml(assetsUrl)}/logo-white.png" alt="${escapeHtml(EMAIL_BRAND.name)}" width="180" style="display:block;margin:0 auto 28px;border:0;outline:none;max-width:180px;width:100%;height:auto;" />
        <h1 style="margin:0;font-size:28px;line-height:1.3;color:#ffffff;font-weight:700;">${safeTitle}</h1>
        ${subtitleHtml}
      </td>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="format-detection" content="telephone=no,date=no,address=no,email=no,url=no">
  <title>${safeTitle}</title>
</head>
<body style="margin:0;padding:0;background:${EMAIL_BRAND.background};font-family:Helvetica,Arial,sans-serif;color:${EMAIL_BRAND.text};">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${EMAIL_BRAND.background};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${EMAIL_BRAND.surface};border:1px solid ${EMAIL_BRAND.border};border-radius:6px;overflow:hidden;">
          <tr>${header}</tr>
          <tr>
            <td style="padding:32px;">${body}</td>
          </tr>
          <tr>
            <td style="padding:32px 24px;background:${EMAIL_BRAND.dark};text-align:center;">
              <img src="${escapeHtml(assetsUrl)}/logo-white.png" alt="${escapeHtml(EMAIL_BRAND.name)}" width="220" style="display:block;margin:0 auto 18px;border:0;outline:none;max-width:220px;width:100%;height:auto;" />
              <p style="margin:0 0 6px;font-size:13px;line-height:1.5;color:rgba(255,255,255,0.85);">
                ${escapeHtml(EMAIL_BRAND.phone)} &nbsp;•&nbsp; ${escapeHtml(EMAIL_BRAND.email)}
              </p>
              <p style="margin:0 0 18px;">
                <a href="${escapeHtml(siteUrl)}/contact-us" style="color:${EMAIL_BRAND.accent};text-decoration:underline;font-size:13px;font-weight:600;">Contact Us</a>
              </p>
              <p style="margin:0;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.6);">
                © ${new Date().getFullYear()} ${escapeHtml(EMAIL_BRAND.name)}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export const emailParagraph = (html: string, options?: { strong?: boolean; muted?: boolean }) => `
  <p style="margin:0 0 20px;font-size:${options?.strong ? "17px" : "16px"};line-height:1.6;color:${options?.muted ? EMAIL_BRAND.muted : "#4b5563"};font-weight:${options?.strong ? "600" : "400"};">
    ${html}
  </p>
`;
