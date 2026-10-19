interface Layout {
  preheader: string;
  title: string;
  content: string;
}

const BRAND_NAME = "USA Limousine Corporation";
const SUPPORT_MESSAGE = "If you did not request this email, you can safely ignore it.";

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function layout({ preheader, title, content }: Layout): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;background:#f3f4f6;color:#111827;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      ${escapeHtml(preheader)}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f3f4f6;">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;">
            <tr>
              <td style="padding:24px 32px;background:#111827;border-radius:12px 12px 0 0;">
                <div style="font-size:22px;font-weight:700;color:#ffffff;">${BRAND_NAME}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px;">
                <h1 style="margin:0 0 20px;font-size:26px;line-height:1.3;color:#111827;">${escapeHtml(title)}</h1>
                ${content}
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px;border-top:1px solid #e5e7eb;font-size:12px;line-height:1.6;color:#6b7280;">
                ${SUPPORT_MESSAGE}<br />
                &copy; ${new Date().getUTCFullYear()} ${BRAND_NAME}. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
