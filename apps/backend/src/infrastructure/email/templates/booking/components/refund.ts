import { emailParagraph } from "../../shared/components/paragraph";
import { escapeHtml } from "../../shared/html";
import { formatPrice } from "./cards";

export function refundParagraph(refundAmount: number) {
  if (refundAmount <= 0) return "";
  return emailParagraph(
    `A refund of ${escapeHtml(formatPrice(refundAmount))} has been issued to your card. It can take 5-10 business days to appear on your statement.`,
  );
}
