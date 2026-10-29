import { BookingType } from "@prisma/client";
import { bookingCancelled } from "../src/infrastructure/email/templates/booking/cancelled";

import { bookingCompleted } from "../src/infrastructure/email/templates/booking/completed";
import { bookingConfirmed } from "../src/infrastructure/email/templates/booking/confirmed";
import { bookingReceived } from "../src/infrastructure/email/templates/booking/received";

import type { BookingEmail } from "../src/infrastructure/email/types/booking";

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
  travelDuration: 42,
  hourlyDuration: null,
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
  flight: { number: "UA100" },
  meetAndGreet: { enabled: true, returnEnabled: false, signName: "Lovelace" },
  luggage: [{ name: "Large Bag", quantity: 2 }],
  extras: [{ name: "Baby Seat", quantity: 1, returnQuantity: 0, unitPrice: 10 }],
  notes: "Call on arrival",
  returnNotes: "Wait at arrivals door 3",
  pricing: {
    basePrice: 200,
    gratuityPrice: 20,
    taxPrice: 10,
    discountPrice: 5,
    extraServicesPrice: 10,
    total: 235,
  },
};

const siteUrl = "https://demo.usalimocorp.com";
const reviewUrl = "https://g.page/r/example/review";

describe("booking email templates", () => {
  it("renders the full booking summary", () => {
    const html = bookingReceived({ booking, siteUrl });

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
    expect(html).toContain("Baby Seat ×1");
    expect(html).not.toContain("Child Seats &amp; Extras");
    expect(html).toContain(
      "https://res.cloudinary.com/cloud/image/upload/usa-limousine/email/mapPin.png",
    );
    expect(html).toContain(
      "https://res.cloudinary.com/cloud/image/upload/w_440/usa-limousine/email/white-logo.png",
    );
    expect(html).toContain("Booking Received");
    expect(html).not.toContain("View booking");
    expect(html).toContain("Call on arrival");
    expect(html).toContain("Return Driver Notes");
    expect(html).toContain("Wait at arrivals door 3");
  });

  it("confirms paid bookings", () => {
    const html = bookingConfirmed({ booking, siteUrl, paid: true });

    expect(html).toContain("Booking Confirmed");
    expect(html).toContain("We have received your payment");
  });

  it("splits a return trip into one-way and return charges", () => {
    const leg = {
      basePrice: 100,
      fuelSurchargePrice: 0,
      gratuityPrice: 10,
      taxPrice: 5,
      transactionFeePrice: 0,
      discountPrice: 2.5,
      airportPickupPrice: 0,
      meetAndGreetPrice: 25,
      total: 112.5,
    };
    const html = bookingConfirmed({
      booking: {
        ...booking,
        extras: [{ name: "Baby Seat", quantity: 1, returnQuantity: 2, unitPrice: 10 }],
        pricing: {
          ...booking.pricing,
          legs: { oneWay: leg, returnTrip: leg },
          rates: {
            fuelSurchargeRate: 0,
            gratuityRate: 10,
            taxRate: 5,
            transactionFeeRate: 0,
            oneWayDiscountRate: 2,
            returnDiscountRate: 3,
          },
        },
      },
      siteUrl,
    });

    expect(html).toContain("Return Base Price");
    expect(html).toContain("Return Gratuity (10%)");
    expect(html).toContain("Discount (2%)");
    expect(html).toContain("Return Discount (3%)");
    expect(html).toContain("Return Meet &amp; Greet");
    expect(html).toContain("Baby Seat ×1");
    expect(html).toContain("Return Baby Seat ×2");
  });

  it("escapes customer-entered text", () => {
    const html = bookingReceived({ booking, siteUrl });

    expect(html).toContain("Mr. &lt;Ada&gt; Lovelace");
    expect(html).not.toContain("<Ada>");
  });

  it("renders every lifecycle email", () => {
    expect(bookingConfirmed({ booking, siteUrl, admin: true })).toContain("New booking request");
    expect(bookingConfirmed({ booking, siteUrl })).toContain("Your booking is confirmed");

    expect(
      bookingCancelled({ booking, siteUrl, reason: "Flight cancelled", refundAmount: 0 }),
    ).toContain("Reason: Flight cancelled");
    expect(
      bookingCancelled({ booking, siteUrl, reason: null, refundAmount: 55.5 }),
    ).toContain("A refund of $55.50 has been issued");
    expect(
      bookingCancelled({ booking, siteUrl, reason: null, refundAmount: 55.5, admin: true }),
    ).toContain("$55.50 was refunded to the customer");

    expect(bookingCompleted({ booking, siteUrl, reviewUrl })).toContain("Leave a Google review");
    expect(bookingCompleted({ booking, siteUrl })).not.toContain("Leave a Google review");
  });
});
