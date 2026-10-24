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
  /** Public website; the logo and contact link point at it. */
  siteUrl: string;
  title: string;
  subtitle?: string | undefined;
  preheader?: string | undefined;
  /** Vehicle photo behind the title; a plain dark header when missing. */
  headerImage?: string | null | undefined;
  body: string;
};

export const emailLayout = ({
  siteUrl,
  title,
  subtitle,
  preheader,
  headerImage,
  body,
}: EmailLayout) => {
  const safeTitle = escapeHtml(title);
  const subtitleHtml = subtitle
    ? `<p style="margin:10px 0 0;font-size:16px;line-height:1.4;color:rgba(255,255,255,0.92);">${escapeHtml(subtitle)}</p>`
    : "";
  const header = headerImage
    ? `<td align="center" valign="middle" background="${escapeHtml(headerImage)}" style="padding:110px 24px;background-image:linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.85) 100%), url('${escapeHtml(headerImage)}');background-position:center;background-repeat:no-repeat;background-size:cover;background-color:${EMAIL_BRAND.dark};text-align:center;">
        <h1 style="margin:0;font-size:30px;line-height:1.3;color:#ffffff;font-weight:700;text-shadow:0 2px 6px rgba(0,0,0,0.85);">${safeTitle}</h1>
        ${subtitleHtml}
      </td>`
    : `<td style="padding:56px 24px;background:${EMAIL_BRAND.dark};border-top:4px solid ${EMAIL_BRAND.accent};text-align:center;">
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
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${EMAIL_BRAND.surface};border:1px solid ${EMAIL_BRAND.border};border-radius:4px;overflow:hidden;">
          <tr>${header}</tr>
          <tr>
            <td style="padding:32px;">${body}</td>
          </tr>
          <tr>
            <td style="padding:32px 24px;background:${EMAIL_BRAND.dark};text-align:center;">
              <img src="${escapeHtml(siteUrl)}/assets/logo/logo-white.png" alt="${escapeHtml(EMAIL_BRAND.name)}" width="220" style="display:block;margin:0 auto 18px;border:0;outline:none;max-width:220px;width:100%;height:auto;" />
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

export const emailButton = (href: string, label: string) => `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
    <tr>
      <td style="background:${EMAIL_BRAND.accent};border-radius:4px;">
        <a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 28px;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;color:#ffffff;">
          ${escapeHtml(label)}
        </a>
      </td>
    </tr>
  </table>
`;
