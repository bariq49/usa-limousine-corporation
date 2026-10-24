import { BookingType } from "@prisma/client";
import { escapeHtml } from "../../../infrastructure/email/templates/layout";
import { EMAIL_BRAND } from "./layout";
import type { BookingEmail } from "./types";

type IconName =
  | "mapPin"
  | "calendar"
  | "clock"
  | "user"
  | "mail"
  | "phone"
  | "car"
  | "hash"
  | "badgeCheck"
  | "seats"
  | "luggage"
  | "bag"
  | "gauge"
  | "tags";

const TRIP_TYPE_LABELS: Record<BookingType, string> = {
  ONE_WAY: "One Way",
  RETURN: "Return",
  HOURLY: "By the Hour",
};

export const formatPrice = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

export const formatDate = (date: string) => {
  const [year, month, day] = date.split("-");
  return year && month && day ? `${month}/${day}/${year}` : date;
};

export const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return time;
  const period = (hours as number) >= 12 ? "PM" : "AM";
  return `${(hours as number) % 12 || 12}:${String(minutes).padStart(2, "0")} ${period}`;
};

const formatHours = (minutes: number) => {
  const hours = Math.round((minutes / 60) * 10) / 10;
  return `${hours} ${hours === 1 ? "hr" : "hrs"}`;
};

const icon = (siteUrl: string, name: IconName, size = 20) =>
  `<img src="${escapeHtml(siteUrl)}/assets/email-icons/${name}.png" width="${size}" height="${size}" alt="" style="display:block;border:0;outline:none;" />`;

export const infoCard = (title: string, content: string) => `
  <div style="padding:20px;background:#f3f4f6;border-radius:4px;margin:0 0 16px;">
    <p style="margin:0;font-size:18px;line-height:1.3;color:${EMAIL_BRAND.text};font-weight:700;">${escapeHtml(title)}</p>
    <div style="margin-top:16px;">${content}</div>
  </div>
`;

const iconRow = (iconHtml: string, text: string) => `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 14px;border-collapse:collapse;">
    <tr>
      <td valign="middle" style="width:24px;padding:0;">${iconHtml}</td>
      <td valign="middle" style="padding:0 0 0 8px;font-size:15px;line-height:1.4;color:${EMAIL_BRAND.text};font-weight:700;">${escapeHtml(text)}</td>
    </tr>
  </table>
`;

const routeStop = (label: string, value: string, note?: string) => `
  <p style="margin:0;font-size:13px;line-height:1.25;color:${EMAIL_BRAND.muted};">${escapeHtml(label)}</p>
  <p style="margin:4px 0 0;font-size:16px;line-height:1.4;color:${EMAIL_BRAND.text};font-weight:600;">${escapeHtml(value)}</p>
  ${note ? `<p style="margin:4px 0 0;font-size:13px;line-height:1.4;color:${EMAIL_BRAND.muted};">${escapeHtml(note)}</p>` : ""}
`;

export const routeCard = (booking: BookingEmail, siteUrl: string) => {
  const isHourly = booking.bookingType === BookingType.HOURLY;
  const points = [
    routeStop("Pickup Location", booking.pickupAddress),
    ...booking.stops.map((stop, index) => routeStop(`Stop ${index + 1}`, stop)),
    isHourly
      ? routeStop(
          "Hourly Duration",
          formatHours(booking.duration),
          "Dedicated chauffeur for your selected hours",
        )
      : routeStop("Drop-off Location", booking.dropoffAddress ?? "—"),
  ];

  return infoCard(
    isHourly ? "Trip Location & Duration" : "Pickup & Drop-off",
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      ${points
        .map((point, index) => {
          const isLast = index === points.length - 1;
          const marker = isLast
            ? icon(siteUrl, isHourly ? "clock" : "mapPin")
            : icon(siteUrl, "mapPin");
          return `<tr>
            <td valign="top" width="20" style="width:20px;padding:0 12px 0 0;">
              ${marker}
              ${isLast ? "" : `<div style="width:2px;height:48px;margin:4px auto;background:${EMAIL_BRAND.accent};"></div>`}
            </td>
            <td valign="top" style="padding:0 0 ${isLast ? "0" : "20px"};">${point}</td>
          </tr>`;
        })
        .join("")}
    </table>`,
  );
};

export const tripDetailsCard = (booking: BookingEmail, siteUrl: string) => {
  const rows = [
    iconRow(
      icon(siteUrl, "calendar"),
      `Pickup: ${formatDate(booking.pickupDate)} | ${formatTime(booking.pickupTime)}`,
    ),
  ];

  if (booking.returnDate && booking.returnTime) {
    rows.push(
      iconRow(
        icon(siteUrl, "calendar"),
        `Return: ${formatDate(booking.returnDate)} | ${formatTime(booking.returnTime)}`,
      ),
    );
  }
  rows.push(iconRow(icon(siteUrl, "tags"), `Trip Type: ${TRIP_TYPE_LABELS[booking.bookingType]}`));
  if (booking.bookingType !== BookingType.HOURLY && booking.distance > 0) {
    rows.push(iconRow(icon(siteUrl, "gauge"), `Distance: ${booking.distance.toFixed(1)} mi`));
  }
  rows.push(iconRow(icon(siteUrl, "seats"), `Passengers: ${booking.passenger.passengerCount}`));
  booking.luggage.forEach((item) => {
    rows.push(iconRow(icon(siteUrl, "luggage"), `${item.name}: ${item.quantity}`));
  });
  booking.extras.forEach((item) => {
    rows.push(iconRow(icon(siteUrl, "seats"), `${item.name} ×${item.quantity}`));
  });
  if (booking.meetAndGreet.enabled) {
    rows.push(
      iconRow(
        icon(siteUrl, "badgeCheck"),
        `Meet & Greet${booking.meetAndGreet.signName ? `: ${booking.meetAndGreet.signName}` : ""}`,
      ),
    );
  }
  if (booking.meetAndGreet.returnEnabled) {
    rows.push(iconRow(icon(siteUrl, "badgeCheck"), "Return Meet & Greet"));
  }
  if (booking.flight.airline) {
    rows.push(iconRow(icon(siteUrl, "tags"), `Airline: ${booking.flight.airline}`));
  }
  if (booking.flight.number) {
    rows.push(iconRow(icon(siteUrl, "hash"), `Flight Number: ${booking.flight.number}`));
  }

  const notes = booking.notes
    ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid ${EMAIL_BRAND.border};">
        <p style="margin:0;font-size:12px;color:${EMAIL_BRAND.muted};font-weight:600;text-transform:uppercase;">Driver Notes</p>
        <p style="margin:4px 0 0;font-size:14px;line-height:1.5;color:${EMAIL_BRAND.text};white-space:pre-wrap;">${escapeHtml(booking.notes)}</p>
      </div>`
    : "";

  return infoCard("Trip Details", rows.join("") + notes);
};

export const passengerCard = (booking: BookingEmail, siteUrl: string) =>
  infoCard(
    "Passenger Details",
    [
      iconRow(icon(siteUrl, "user"), booking.passenger.name),
      iconRow(icon(siteUrl, "mail"), booking.passenger.email),
      booking.passenger.ccEmail
        ? iconRow(icon(siteUrl, "mail"), `CC: ${booking.passenger.ccEmail}`)
        : "",
      iconRow(icon(siteUrl, "phone"), booking.passenger.phone),
    ].join(""),
  );

export const vehicleCard = (booking: BookingEmail, siteUrl: string) => {
  const { vehicle, vehicleCount } = booking;
  const name = vehicleCount > 1 ? `${vehicle.name} × ${vehicleCount}` : vehicle.name;

  return infoCard(
    "Vehicle Choice",
    `${iconRow(icon(siteUrl, "car"), name)}
    ${vehicle.description ? `<p style="margin:0;font-size:13px;color:${EMAIL_BRAND.muted};">${escapeHtml(vehicle.description)}</p>` : ""}
    <p style="margin:6px 0 0;font-size:13px;font-weight:600;color:${EMAIL_BRAND.accent};">Up to ${vehicle.passengerCount * vehicleCount} passengers</p>`,
  );
};

const priceRow = (label: string, amount: number, options?: { discount?: boolean }) => {
  const color = options?.discount ? "#dc2626" : EMAIL_BRAND.text;
  return `<tr>
    <td style="padding:0 12px 10px 0;font-size:14px;line-height:1.4;color:${color};font-weight:600;">${escapeHtml(label)}</td>
    <td align="right" style="padding:0 0 10px;font-size:14px;line-height:1.4;color:${color};font-weight:700;white-space:nowrap;">${options?.discount ? "- " : ""}${escapeHtml(formatPrice(amount))}</td>
  </tr>`;
};

export const paymentSummaryCard = (booking: BookingEmail) => {
  const { pricing } = booking;
  const rates = pricing.rates;
  const lines: [string, number | undefined, boolean?][] = [
    ["Base Price", pricing.basePrice],
    [`Fuel Surcharge${rates ? ` (${rates.fuelSurchargeRate}%)` : ""}`, pricing.fuelSurchargePrice],
    [`Gratuity${rates ? ` (${rates.gratuityRate}%)` : ""}`, pricing.gratuityPrice],
    [`Tax${rates ? ` (${rates.taxRate}%)` : ""}`, pricing.taxPrice],
    [
      `Transaction Fee${rates ? ` (${rates.transactionFeeRate}%)` : ""}`,
      pricing.transactionFeePrice,
    ],
    ["Discount", pricing.discountPrice, true],
    ["Airport Pickup", pricing.airportPickupPrice],
    ["Additional Stops", pricing.stopsPrice],
    ["Meet & Greet", pricing.meetAndGreetPrice],
    ["Child Seats & Extras", pricing.extraServicesPrice],
  ];

  return infoCard(
    "Payment Summary",
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      ${lines
        .filter(([, amount]) => (amount ?? 0) > 0)
        .map(([label, amount, discount]) =>
          priceRow(label, amount as number, { discount: Boolean(discount) }),
        )
        .join("")}
      <tr>
        <td style="padding:12px 12px 0 0;border-top:1px solid ${EMAIL_BRAND.border};font-size:16px;line-height:1.4;color:${EMAIL_BRAND.text};font-weight:700;">Total</td>
        <td align="right" style="padding:12px 0 0;border-top:1px solid ${EMAIL_BRAND.border};font-size:18px;line-height:1.4;color:${EMAIL_BRAND.accent};font-weight:700;white-space:nowrap;">${escapeHtml(formatPrice(pricing.total))}</td>
      </tr>
    </table>`,
  );
};

export const bookingSummary = (booking: BookingEmail, siteUrl: string) => `
  ${routeCard(booking, siteUrl)}
  ${tripDetailsCard(booking, siteUrl)}
  ${passengerCard(booking, siteUrl)}
  ${vehicleCard(booking, siteUrl)}
  ${paymentSummaryCard(booking)}
`;

export const googleReviewCard = (reviewUrl: string) => `
  <div style="padding:24px 20px;background:#ffffff;border:1px solid ${EMAIL_BRAND.border};border-radius:4px;margin:0 0 24px;text-align:center;">
    <img src="https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png" width="40" height="40" alt="Google" style="display:block;margin:0 auto 12px;border:0;outline:none;" />
    <p style="margin:0;font-size:18px;line-height:1.3;color:${EMAIL_BRAND.text};font-weight:700;">How was your experience?</p>
    <p style="margin:8px 0 20px;font-size:14px;line-height:1.5;color:${EMAIL_BRAND.muted};">We would love a short review on our Google Business Profile.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
      <tr>
        <td style="background:${EMAIL_BRAND.accent};border-radius:4px;">
          <a href="${escapeHtml(reviewUrl)}" style="display:inline-block;padding:14px 28px;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;color:#ffffff;">Leave a Google review</a>
        </td>
      </tr>
    </table>
  </div>
`;
