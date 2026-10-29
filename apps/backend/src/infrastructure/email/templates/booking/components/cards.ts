import { BookingType } from "@prisma/client";
import { formatDate } from "../../../../../common/utils/format-date";
import { formatTime } from "../../../../../common/utils/format-time";
import type { LegPricing } from "../../../../../modules/platform-settings/types/platform-settings";
import type { BookingEmail } from "../../../types/booking";
import { EMAIL_BRAND } from "../../shared/brand";
import { emailAssetsUrl, escapeHtml } from "../../shared/html";


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

const formatHours = (minutes: number) => {
  const hours = Math.round((minutes / 60) * 10) / 10;
  return `${hours} ${hours === 1 ? "hr" : "hrs"}`;
};

const icon = (name: IconName, size = 20) =>
  `<img src="${escapeHtml(emailAssetsUrl())}/${name}.png" width="${size}" height="${size}" alt="" style="display:block;border:0;outline:none;" />`;

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

export const routeCard = (booking: BookingEmail) => {
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
          const marker = isLast ? icon(isHourly ? "clock" : "mapPin") : icon("mapPin");
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

export const tripDetailsCard = (booking: BookingEmail) => {
  const rows = [
    iconRow(
      icon("calendar"),
      `Pickup: ${formatDate({ date: booking.pickupDate })} | ${formatTime({ date: booking.pickupTime })}`,
    ),
  ];

  if (booking.returnDate && booking.returnTime) {
    rows.push(
      iconRow(
        icon("calendar"),
        `Return: ${formatDate({ date: booking.returnDate })} | ${formatTime({ date: booking.returnTime })}`,
      ),
    );
  }
  rows.push(iconRow(icon("tags"), `Trip Type: ${TRIP_TYPE_LABELS[booking.bookingType]}`));
  if (booking.bookingType !== BookingType.HOURLY && booking.distance > 0) {
    rows.push(iconRow(icon("gauge"), `Distance: ${booking.distance.toFixed(1)} mi`));
  }
  rows.push(iconRow(icon("seats"), `Passengers: ${booking.passenger.passengerCount}`));
  booking.luggage.forEach((item) => {
    rows.push(iconRow(icon("luggage"), `${item.name}: ${item.quantity}`));
  });
  booking.extras.forEach((item) => {
    if (item.quantity > 0) {
      rows.push(iconRow(icon("seats"), `${item.name} ×${item.quantity}`));
    }
    if (item.returnQuantity > 0) {
      rows.push(iconRow(icon("seats"), `Return ${item.name} ×${item.returnQuantity}`));
    }
  });
  if (booking.meetAndGreet.enabled) {
    rows.push(
      iconRow(
        icon("badgeCheck"),
        `Meet & Greet${booking.meetAndGreet.signName ? `: ${booking.meetAndGreet.signName}` : ""}`,
      ),
    );
  }
  if (booking.meetAndGreet.returnEnabled) {
    rows.push(iconRow(icon("badgeCheck"), "Return Meet & Greet"));
  }
  if (booking.flight.number) {
    rows.push(iconRow(icon("hash"), `Flight Number: ${booking.flight.number}`));
  }

  const notesBlock = (title: string, text: string | null) =>
    text
      ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid ${EMAIL_BRAND.border};">
        <p style="margin:0;font-size:12px;color:${EMAIL_BRAND.muted};font-weight:600;text-transform:uppercase;">${title}</p>
        <p style="margin:4px 0 0;font-size:14px;line-height:1.5;color:${EMAIL_BRAND.text};white-space:pre-wrap;">${escapeHtml(text)}</p>
      </div>`
      : "";

  return infoCard(
    "Trip Details",
    rows.join("") +
      notesBlock("Driver Notes", booking.notes) +
      notesBlock("Return Driver Notes", booking.returnNotes),
  );
};

export const passengerCard = (booking: BookingEmail) =>
  infoCard(
    "Passenger Details",
    [
      iconRow(icon("user"), booking.passenger.name),
      iconRow(icon("mail"), booking.passenger.email),
      booking.passenger.ccEmail ? iconRow(icon("mail"), `CC: ${booking.passenger.ccEmail}`) : "",
      iconRow(icon("phone"), booking.passenger.phone),
    ].join(""),
  );

export const vehicleCard = (booking: BookingEmail) => {
  const { vehicle, vehicleCount } = booking;
  const name = vehicleCount > 1 ? `${vehicle.name} × ${vehicleCount}` : vehicle.name;

  return infoCard(
    "Vehicle Choice",
    `${iconRow(icon("car"), name)}
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

type ChargeLine = [string, number | undefined, boolean?];

export const chargeLines = (booking: BookingEmail) => {
  const { pricing } = booking;
  const rates = pricing.rates;
  const extrasTotal = booking.extras.reduce(
    (sum, item) => sum + item.unitPrice * (item.quantity + item.returnQuantity),
    0,
  );
  const luggagePrice = Math.round(((pricing.extraServicesPrice ?? 0) - extrasTotal) * 100) / 100;
  const percent = (value: number | undefined) => (value != null ? ` (${value}%)` : "");
  const legCharges = (
    prefix: string,
    leg: Partial<LegPricing>,
    discountRate: number | undefined,
    quantityOf: (item: BookingEmail["extras"][number]) => number,
  ): ChargeLine[] =>
    (
      [
        [`${prefix}Base Price`, leg.basePrice],
        [`${prefix}Fuel Surcharge${percent(rates?.fuelSurchargeRate)}`, leg.fuelSurchargePrice],
        [`${prefix}Gratuity${percent(rates?.gratuityRate)}`, leg.gratuityPrice],
        [`${prefix}Tax${percent(rates?.taxRate)}`, leg.taxPrice],
        [`${prefix}Transaction Fee${percent(rates?.transactionFeeRate)}`, leg.transactionFeePrice],
        [`${prefix}Discount${percent(discountRate)}`, leg.discountPrice, true],
        [`${prefix}Airport Pickup`, leg.airportPickupPrice],
        [`${prefix}Meet & Greet`, leg.meetAndGreetPrice],
      ] as ChargeLine[]
    ).concat(
      booking.extras.map((item): [string, number] => [
        `${prefix}${item.name} ×${quantityOf(item)}`,
        item.unitPrice * quantityOf(item),
      ]),
    );
  const charges = pricing.legs
    ? legCharges("", pricing.legs.oneWay, rates?.oneWayDiscountRate, (item) => item.quantity).concat(
        legCharges(
          "Return ",
          pricing.legs.returnTrip,
          rates?.returnDiscountRate,
          (item) => item.returnQuantity,
        ),
      )
    : legCharges("", pricing, undefined, (item) => item.quantity + item.returnQuantity);
  const lines = charges.concat([
    ["Additional Stops", pricing.stopsPrice],
    ["Luggage", luggagePrice],
    ["Notifications", pricing.notificationsPrice],
  ]);

  return lines
    .filter(([, amount]) => (amount ?? 0) > 0)
    .map(([label, amount, discount]) => ({
      label,
      amount: amount as number,
      discount: Boolean(discount),
    }));
};

export const paymentSummaryCard = (booking: BookingEmail) => {
  const { pricing } = booking;

  return infoCard(
    "Payment Summary",
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      ${chargeLines(booking)
        .map((line) => priceRow(line.label, line.amount, { discount: line.discount }))
        .join("")}
      <tr>
        <td style="padding:12px 12px 0 0;border-top:1px solid ${EMAIL_BRAND.border};font-size:16px;line-height:1.4;color:${EMAIL_BRAND.text};font-weight:700;">Total</td>
        <td align="right" style="padding:12px 0 0;border-top:1px solid ${EMAIL_BRAND.border};font-size:18px;line-height:1.4;color:${EMAIL_BRAND.accent};font-weight:700;white-space:nowrap;">${escapeHtml(formatPrice(pricing.total))}</td>
      </tr>
    </table>`,
  );
};

export const bookingSummary = (booking: BookingEmail) => `
  ${routeCard(booking)}
  ${tripDetailsCard(booking)}
  ${passengerCard(booking)}
  ${vehicleCard(booking)}
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
