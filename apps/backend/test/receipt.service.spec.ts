import { Prisma } from "@prisma/client";
import { BookingEmailService } from "../src/modules/booking/services/email.service";
import { ReceiptService } from "../src/modules/booking/services/receipt.service";

const booking = (payment: Record<string, unknown> | null) => ({
  id: "book-1",
  userId: null,
  bookingNumber: "BK-000029",
  bookingType: "ONE_WAY",
  vehicleCount: 1,
  vehicleCategory: { name: "Sedan", description: null, image: null, passengerCount: 4 },
  address: {
    pickup: { address: "JFK Airport" },
    dropoff: { address: "Times Square" },
    distance: 18,
    travelDuration: 40,
  },
  passenger: { passengerCount: 1, name: "Ada", email: "ada@example.com", phone: "+17322898928" },
  bookingTime: { pickupDate: "2030-09-11", pickupTime: "14:00" },
  flightDetails: null,
  meetAndGreet: null,
  luggage: [],
  extraServices: [],
  notes: null,
  returnNotes: null,
  pricing: { basePrice: 100, total: 110 },
  payment,
});

const paid = {
  status: "PAID",
  amount: new Prisma.Decimal(110),
  cardBrand: "VISA",
  cardLast4: "4242",
  transactionId: "TXN-1",
  paidAt: new Date("2030-09-01T10:00:00Z"),
  refundedAmount: null,
  refundedAt: null,
};

function setup(payment: Record<string, unknown> | null) {
  const repository = {
    findByOrderId: jest.fn(async () => ({ id: "book-1" })),
    findById: jest.fn(async () => booking(payment)),
  };
  const config = {
    getOrThrow: (key: string) =>
      ({ WEBSITE_URL: "https://demo.usalimocorp.com", CLOUDINARY_CLOUD_NAME: "cloud" })[key],
  };
  const emails = new BookingEmailService(
    {} as never,
    {} as never,
    config as never,
    { error: jest.fn() } as never,
  );
  const service = new ReceiptService(
    repository as never,
    emails,
    config as never,
    { error: jest.fn() } as never,
  );
  return { service };
}

describe("ReceiptService", () => {
  beforeEach(() => {
    jest.spyOn(global, "fetch").mockRejectedValue(new Error("offline"));
  });

  afterEach(() => jest.restoreAllMocks());

  it("builds a PDF receipt for a paid booking, even without the logo", async () => {
    const { service } = setup(paid);

    const receipt = await service.forOrder("ORDER123456789");

    expect(receipt.fileName).toBe("receipt-BK-000029.pdf");
    expect(receipt.pdf.subarray(0, 4).toString()).toBe("%PDF");
  });

  it("refuses a receipt before the booking is paid", async () => {
    const { service } = setup(null);

    await expect(service.forOrder("ORDER123456789")).rejects.toThrow(
      "A receipt is available once the booking is paid",
    );
  });

  it("still issues a receipt after a refund", async () => {
    const { service } = setup(
      Object.assign({}, paid, {
        status: "REFUNDED",
        refundedAmount: new Prisma.Decimal(110),
        refundedAt: new Date("2030-09-02T10:00:00Z"),
      }),
    );

    await expect(service.forOrder("ORDER123456789")).resolves.toEqual(
      expect.objectContaining({ fileName: "receipt-BK-000029.pdf" }),
    );
  });
});
