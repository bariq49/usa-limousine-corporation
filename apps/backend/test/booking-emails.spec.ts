import { BookingType } from "@prisma/client";
import {
  bookingCancelled,
  bookingCancelledAdmin,
  bookingCompleted,
  bookingConfirmed,
  bookingReceived,
  newBookingAdmin,
} from "../src/modules/booking/emails/templates";
import type { BookingEmail, EmailContext } from "../src/modules/booking/emails/types";

const booking: BookingEmail = {
  id: "book-1",
  bookingNumber: "BK-1001",
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
  assetsUrl: "https://res.cloudinary.com/cloud/image/upload/usa-limousine/email",
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
    expect(html).toContain(
      "https://res.cloudinary.com/cloud/image/upload/usa-limousine/email/mapPin.png",
    );
    expect(html).toContain(
      "https://res.cloudinary.com/cloud/image/upload/usa-limousine/email/logo-white.png",
    );
    expect(html).toContain("Booking Received");
    expect(html).not.toContain("View booking");
  });

  it("confirms paid bookings", () => {
    const html = bookingConfirmed(booking, context, true);

    expect(html).toContain("Booking Confirmed");
    expect(html).toContain("We have received your payment");
  });

  it("escapes customer-entered text", () => {
    const html = bookingReceived(booking, context);

    expect(html).toContain("Mr. &lt;Ada&gt; Lovelace");
    expect(html).not.toContain("<Ada>");
  });

  it("renders every lifecycle email", () => {
    expect(newBookingAdmin(booking, context)).toContain("New booking request");
    expect(bookingConfirmed(booking, context)).toContain("Your booking is confirmed");
    expect(bookingCancelled(booking, context, "Flight cancelled", 0)).toContain(
      "Reason: Flight cancelled",
    );
    expect(bookingCancelled(booking, context, null, 55.5)).toContain(
      "A refund of $55.50 has been issued",
    );
    expect(bookingCancelledAdmin(booking, context, null, 55.5)).toContain(
      "$55.50 was refunded to the customer",
    );
    expect(bookingCompleted(booking, context)).toContain("Leave a Google review");
    expect(
      bookingCompleted(booking, { siteUrl: context.siteUrl, assetsUrl: context.assetsUrl }),
    ).not.toContain("Leave a Google review");
  });
});
