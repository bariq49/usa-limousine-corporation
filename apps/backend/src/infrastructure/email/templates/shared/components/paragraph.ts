import { EMAIL_BRAND } from "../brand";

export function emailParagraph(
  html: string,
  options?: { strong?: boolean; muted?: boolean },
): string {
  return `
  <p style="margin:0 0 20px;font-size:${options?.strong ? "17px" : "16px"};line-height:1.6;color:${options?.muted ? EMAIL_BRAND.muted : "#4b5563"};font-weight:${options?.strong ? "600" : "400"};">
    ${html}
  </p>
`;
}
