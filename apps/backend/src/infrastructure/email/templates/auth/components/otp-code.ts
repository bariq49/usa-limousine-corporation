import { EMAIL_BRAND } from "../../shared/brand";
import { escapeHtml } from "../../shared/html";


export function otpCodeCard(props: { label: string; token: string }) {
  const { label, token } = props;
  return `
    <div style="margin:28px 0;padding:20px;text-align:center;background:${EMAIL_BRAND.soft};border:1px solid ${EMAIL_BRAND.border};border-radius:8px;">
      <div style="margin-bottom:8px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${EMAIL_BRAND.muted};">
        ${escapeHtml(label)}
      </div>
      <div style="font-family:'Courier New',monospace;font-size:32px;font-weight:700;letter-spacing:6px;color:${EMAIL_BRAND.text};">
        ${escapeHtml(token)}
      </div>
    </div>
  `;
}
