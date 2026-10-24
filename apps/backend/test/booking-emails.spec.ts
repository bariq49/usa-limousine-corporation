import { BookingType } from "@prisma/client";
import {
  bookingCancelled,
  bookingCompleted,
  bookingConfirmed,
  bookingReceived,
  newBookingAdmin,
} from "../src/modules/booking/emails/templates";
import type { BookingEmail, EmailContext } from "../src/modules/booking/emails/types";

const booking: BookingEmail = {
  id: "book-1",
  bookingNumber: "BK-1001",
  hasAccount: true,
  bookingType: BookingType.RETURN,
  vehicleCount: 2,
  vehicle: { name: "Sedan", description: "Executive sedan", image: null, passengerCount: 4 },
  pickupAddress: "Newark Liberty International Airport, Newark, NJ",
  dropoffAddress: "Times Square, New York, NY",
  stops: ["Hoboken, NJ"],
  distance: 16.4,
  duration: 42,
  pickupDate: "2026-11-02",
  pickupTime: "14:30",
  returnDate: "2026-11-05",
  returnTime: "09:00",
  passenger: {
    name: "Mr. <Ada> Lovelace",
    email: "ada@example.com",
    phone: "+17322898928",
    ccEmail: "assistant@example.com",
    passengerCount: 6,
  },
  flight: { airline: "United", number: "UA100" },
  meetAndGreet: { enabled: true, returnEnabled: false, signName: "Lovelace" },
  luggage: [{ name: "Large Bag", quantity: 2 }],
  extras: [{ name: "Baby Seat", quantity: 1, unitPrice: 10 }],
  notes: "Call on arrival",
  pricing: {
    basePrice: 200,
    gratuityPrice: 20,
    taxPrice: 10,
    discountPrice: 5,
    extraServicesPrice: 10,
    total: 235,
  },
};

const context: EmailContext = {
  siteUrl: "https://demo.usalimocorp.com",
  portalUrl: "https://customer.usalimocorp.com",
  reviewUrl: "https://g.page/r/example/review",
};

describe("booking email templates", () => {
  it("renders the full booking summary", () => {
    const html = bookingReceived(booking, context);

    expect(html).toContain("BK-1001");
    expect(html).toContain("Sedan × 2");
    expect(html).toContain("Up to 8 passengers");
    expect(html).toContain("Stop 1");
    expect(html).toContain("Return: 11/05/2026 | 9:00 AM");
    expect(html).toContain("Pickup: 11/02/2026 | 2:30 PM");
    expect(html).toContain("Large Bag: 2");
    expect(html).toContain("Baby Seat ×1");
    expect(html).toContain("CC: assistant@example.com");
    expect(html).toContain("$235.00");
    expect(html).toContain("https://customer.usalimocorp.com/bookings/book-1");
    expect(html).toContain("https://demo.usalimocorp.com/assets/email-icons/mapPin.png");
  });

  it("leaves the portal link out of guest booking emails", () => {
    const html = bookingConfirmed(Object.assign({}, booking, { hasAccount: false }), context, true);

    expect(html).toContain("We have received your payment");
    expect(html).not.toContain("/bookings/book-1");
  });

  it("escapes customer-entered text", () => {
    const html = bookingReceived(booking, context);

    expect(html).toContain("Mr. &lt;Ada&gt; Lovelace");
    expect(html).not.toContain("<Ada>");
  });

  it("renders every lifecycle email", () => {
    expect(newBookingAdmin(booking, context)).toContain("New booking request");
    expect(bookingConfirmed(booking, context)).toContain("Your booking is confirmed");
    expect(bookingCancelled(booking, context, "Flight cancelled")).toContain(
      "Reason: Flight cancelled",
    );
    expect(bookingCompleted(booking, context)).toContain("Leave a Google review");
    expect(
      bookingCompleted(booking, { siteUrl: context.siteUrl, portalUrl: context.portalUrl }),
    ).not.toContain("Leave a Google review");
  });
});
