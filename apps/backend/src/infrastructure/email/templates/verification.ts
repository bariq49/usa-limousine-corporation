import type { Verification } from "../types/verification";
import { escapeHtml } from "./layout";

const BRAND_NAME = "USA Limousine Corporation";

export function verification({ token, expiresInMinutes = 24 * 60 }: Verification): string {
  const safeToken = escapeHtml(token);
  const expiryLabel =
    expiresInMinutes >= 60
      ? String(Math.round(expiresInMinutes / 60)) + " hour" + (expiresInMinutes >= 120 ? "s" : "")
      : String(expiresInMinutes) + " minutes";
  const codeCells = safeToken
    .split("")
    .map(
      (digit) =>
        '<td width="48" height="58" align="center" valign="middle" style="border:1px solid #d8c487;border-radius:8px;background:#fffdf7;font-family:Arial,Helvetica,sans-serif;font-size:26px;font-weight:700;color:#101827;">' +
        digit +
        "</td>",
    )
    .join('<td width="8" style="font-size:0;line-height:0;">&nbsp;</td>');
  const markup = [
    '<!doctype html><html lang="en"><head><meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    '<meta name="x-apple-disable-message-reformatting" /><title>Confirm your email address</title></head>',
    '<body style="margin:0;padding:0;background:#edf0f2;color:#101827;font-family:Arial,Helvetica,sans-serif;">',
    '<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Your USA Limousine Corporation verification code is ready.</div>',
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#edf0f2;"><tr><td align="center" style="padding:44px 16px;">',
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;background:#ffffff;">',
    '<tr><td style="height:5px;background:#C9A84C;font-size:0;line-height:0;">&nbsp;</td></tr>',
    '<tr><td style="padding:30px 40px 28px;background:#101827;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>',
    '<td valign="middle"><div style="font-size:25px;font-weight:800;letter-spacing:-0.5px;color:#ffffff;">USA <span style="font-weight:400;">Limousine</span></div>',
    '<div style="margin-top:5px;font-size:10px;font-weight:700;letter-spacing:3px;color:#C9A84C;">CORPORATION</div></td>',
    '<td align="right" valign="middle" style="font-size:10px;font-weight:700;letter-spacing:1.8px;color:#cbd5e1;">EMAIL VERIFICATION</td>',
    "</tr></table></td></tr>",
    '<tr><td style="padding:46px 40px 38px;"><table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td width="38" height="3" style="background:#C9A84C;font-size:0;line-height:0;">&nbsp;</td></tr></table>',
    '<h1 style="margin:20px 0 14px;font-size:30px;line-height:1.2;letter-spacing:-0.7px;color:#101827;">Confirm your email</h1>',
    '<p style="margin:0;max-width:450px;font-size:16px;line-height:1.75;color:#4b5b70;">Welcome to USA Limousine Corporation. Use the six-digit security code below to activate your account and continue your journey with us.</p>',
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:32px;border:1px solid #e6dec4;background:#fbfaf5;"><tr><td style="padding:22px 24px 24px;" align="center">',
    '<div style="margin-bottom:16px;font-size:10px;font-weight:800;letter-spacing:2.4px;color:#9b7a2d;">YOUR SECURE ACCESS CODE</div>',
    '<table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>{{CODE_CELLS}}</tr></table></td></tr></table>',
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:26px;"><tr><td width="4" style="background:#C9A84C;font-size:0;line-height:0;">&nbsp;</td>',
    '<td style="padding-left:14px;font-size:13px;line-height:1.65;color:#5c6b7d;">This code expires in <strong style="color:#101827;">{{EXPIRY}}</strong>. Do not share it with anyone—our team will never ask for it.</td>',
    "</tr></table></td></tr>",
    '<tr><td style="padding:26px 40px;background:#101827;"><p style="margin:0 0 8px;font-size:12px;line-height:1.6;color:#d4dbe5;">Didn&rsquo;t request this email? You can safely ignore it.</p>',
    '<p style="margin:0;font-size:11px;letter-spacing:0.2px;color:#8794a8;">&copy; {{YEAR}} ' +
      BRAND_NAME +
      ". All rights reserved.</p></td></tr>",
    "</table></td></tr></table></body></html>",
  ].join("");

  return markup
    .replace("{{CODE_CELLS}}", codeCells)
    .replace("{{EXPIRY}}", escapeHtml(expiryLabel))
    .replace("{{YEAR}}", String(new Date().getUTCFullYear()));
}
