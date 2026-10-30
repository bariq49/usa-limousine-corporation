import PDFDocument from "pdfkit";
import type { BookingType } from "@prisma/client";
import { PLATFORM } from "@usa-limousine-corporation/config";
import { formatDate } from "../../../../common/utils/format-date";
import { formatTime } from "../../../../common/utils/format-time";
import type { ReceiptProps } from "../../types/booking";
import { EMAIL_BRAND } from "../shared/brand";

import { chargeLines, formatPrice } from "./components/cards";

const TRIP_LABELS: Record<BookingType, string> = {
  ONE_WAY: "One way",
  RETURN: "Return",
  HOURLY: "By the hour",
};

const PAGE_MARGIN = 44;
const HEADER_HEIGHT = 120;
const FOOTER_HEIGHT = 64;
const DANGER = "#b91c1c";

const shortDate = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: PLATFORM.locale.timezone,
  }).format(date);

export function renderReceiptPdf(props: ReceiptProps): Promise<Buffer> {
  const { booking, payment, logo, siteUrl, issuedAt } = props;
  const doc = new PDFDocument({
    size: "LETTER",
    margins: { top: PAGE_MARGIN, left: PAGE_MARGIN, right: PAGE_MARGIN, bottom: 0 },
    info: {
      Title: `Receipt ${booking.bookingNumber}`,
      Author: EMAIL_BRAND.name,
      Subject: "Booking receipt",
    },
  });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  const pageWidth = doc.page.width;
  const contentWidth = pageWidth - PAGE_MARGIN * 2;
  const left = PAGE_MARGIN;
  const right = pageWidth - PAGE_MARGIN;

  doc.rect(0, 0, pageWidth, HEADER_HEIGHT).fill(EMAIL_BRAND.dark);
  doc.rect(0, HEADER_HEIGHT, pageWidth, 3).fill(EMAIL_BRAND.accent);
  if (logo) {
    doc.image(logo, left, 33, { fit: [240, 72], valign: "center" });
  } else {
    doc.font("Helvetica-Bold").fontSize(22).fillColor("#ffffff").text(EMAIL_BRAND.name, left, 44);
  }
  doc
    .font("Helvetica-Bold")
    .fontSize(22)
    .fillColor(EMAIL_BRAND.accent)
    .text("RECEIPT", left, 34, { width: contentWidth, align: "right" });
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#d1d5db")
    .text(`Booking ${booking.bookingNumber}`, left, 62, { width: contentWidth, align: "right" })
    .text(`Issued ${shortDate(issuedAt)}`, left, 76, { width: contentWidth, align: "right" });

  const isRefunded = payment?.status === "REFUNDED";

  let y = HEADER_HEIGHT + 24;
  doc
    .font("Helvetica-Bold")
    .fontSize(20)
    .fillColor(EMAIL_BRAND.text)
    .text(formatPrice(payment?.amount ?? booking.pricing.total), left, y - 2, {
      width: contentWidth,
      align: "right",
    });
  y += 36;

  const columnWidth = (contentWidth - 24) / 2;
  const label = (text: string, x: number, top: number) =>
    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor(EMAIL_BRAND.muted)
      .text(text.toUpperCase(), x, top, { width: columnWidth, characterSpacing: 0.6 });
  const lines = (values: string[], x: number, top: number) => {
    doc.font("Helvetica").fontSize(10).fillColor(EMAIL_BRAND.text);
    values.forEach((value, index) => {
      doc.text(value, x, top + index * 14, { width: columnWidth });
    });
    return top + values.length * 14;
  };

  label("Billed to", left, y);
  const billedEnd = lines(
    [booking.passenger.name, booking.passenger.email, booking.passenger.phone].filter(Boolean),
    left,
    y + 14,
  );
  const paymentX = left + columnWidth + 24;
  label("Payment", paymentX, y);
  const paymentEnd = lines(
    payment
      ? [
          payment.cardBrand && payment.cardLast4
            ? `${payment.cardBrand} •••• ${payment.cardLast4}`
            : "Card payment",
          payment.paidAt ? `Paid ${shortDate(payment.paidAt)}` : "Paid",
          payment.transactionId ? `Ref ${payment.transactionId}` : "",
        ].filter(Boolean)
      : ["Awaiting payment"],
    paymentX,
    y + 14,
  );
  y = Math.max(billedEnd, paymentEnd) + 18;

  const passengers = booking.passenger.passengerCount;
  const vehicle =
    booking.vehicleCount > 1
      ? `${booking.vehicle.name} × ${booking.vehicleCount}`
      : booking.vehicle.name;
  const tripRows: [string, string][] = [
    [
      "Trip",
      `${TRIP_LABELS[booking.bookingType]} · ${vehicle} · ${passengers} ${passengers === 1 ? "passenger" : "passengers"}`,
    ],
    ["Pickup", `${formatDate({ date: booking.pickupDate })} at ${formatTime({ date: booking.pickupTime })}`],
  ];
  if (booking.returnDate && booking.returnTime) {
    tripRows.push([
      "Return",
      `${formatDate({ date: booking.returnDate })} at ${formatTime({ date: booking.returnTime })}`,
    ]);
  }
  tripRows.push(["From", booking.pickupAddress]);
  booking.stops.forEach((stop, index) => tripRows.push([`Stop ${index + 1}`, stop]));
  if (booking.dropoffAddress) tripRows.push(["To", booking.dropoffAddress]);
  if (booking.flight.number) tripRows.push(["Flight", booking.flight.number]);

  const sectionTitle = (text: string) => {
    doc.font("Helvetica-Bold").fontSize(12).fillColor(EMAIL_BRAND.text).text(text, left, y);
    y += 18;
  };

  sectionTitle("Trip details");
  const tripTop = y;
  const labelWidth = 90;
  doc.font("Helvetica").fontSize(10);
  const tripHeight =
    tripRows.reduce(
      (total, [, value]) =>
        total +
        Math.max(13, doc.heightOfString(value, { width: contentWidth - labelWidth - 32 })) +
        4,
      0,
    ) + 14;
  doc.roundedRect(left, tripTop, contentWidth, tripHeight, 4).fill(EMAIL_BRAND.soft);
  y = tripTop + 9;
  tripRows.forEach(([name, value]) => {
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor(EMAIL_BRAND.muted)
      .text(name, left + 16, y, {
        width: labelWidth,
      });
    doc.fillColor(EMAIL_BRAND.text).text(value, left + 16 + labelWidth, y, {
      width: contentWidth - labelWidth - 32,
    });
    y += Math.max(13, doc.heightOfString(value, { width: contentWidth - labelWidth - 32 })) + 4;
  });
  y = tripTop + tripHeight + 20;

  sectionTitle("Charges");
  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor(EMAIL_BRAND.muted)
    .text("DESCRIPTION", left, y, { characterSpacing: 0.6 })
    .text("AMOUNT", left, y, { width: contentWidth, align: "right", characterSpacing: 0.6 });
  y += 14;
  doc.moveTo(left, y).lineTo(right, y).lineWidth(0.5).strokeColor(EMAIL_BRAND.border).stroke();
  y += 8;

  chargeLines(booking).forEach((line) => {
    if (y > doc.page.height - FOOTER_HEIGHT - 70) {
      doc.addPage();
      y = PAGE_MARGIN;
    }
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor(line.discount ? DANGER : EMAIL_BRAND.text)
      .text(line.label, left, y, { width: contentWidth - 110 })
      .text(`${line.discount ? "- " : ""}${formatPrice(line.amount)}`, left, y, {
        width: contentWidth,
        align: "right",
      });
    y += 15;
  });

  y += 2;
  doc.moveTo(left, y).lineTo(right, y).lineWidth(1).strokeColor(EMAIL_BRAND.text).stroke();
  y += 12;
  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor(EMAIL_BRAND.text)
    .text("Total paid", left, y)
    .text(formatPrice(booking.pricing.total), left, y, { width: contentWidth, align: "right" });
  y += 24;

  if (isRefunded && payment?.refundedAmount) {
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor(DANGER)
      .text(`Refunded${payment.refundedAt ? ` on ${shortDate(payment.refundedAt)}` : ""}`, left, y)
      .text(`- ${formatPrice(payment.refundedAmount)}`, left, y, {
        width: contentWidth,
        align: "right",
      });
    y += 20;
  }

  const footerTop = doc.page.height - FOOTER_HEIGHT;
  doc
    .moveTo(left, footerTop)
    .lineTo(right, footerTop)
    .lineWidth(0.5)
    .strokeColor(EMAIL_BRAND.border)
    .stroke();
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor(EMAIL_BRAND.text)
    .text(`Thank you for riding with ${EMAIL_BRAND.name}.`, left, footerTop + 12, {
      width: contentWidth,
      align: "center",
    });
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(EMAIL_BRAND.muted)
    .text(
      `${EMAIL_BRAND.phone}  ·  ${EMAIL_BRAND.email}  ·  ${siteUrl.replace(/^https?:\/\//, "")}`,
      left,
      footerTop + 28,
      { width: contentWidth, align: "center" },
    );

  doc.end();
  return done;
}
