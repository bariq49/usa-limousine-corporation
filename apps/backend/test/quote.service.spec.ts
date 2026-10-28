import { ConflictException } from "@nestjs/common";
import { BookingType, Prisma } from "@prisma/client";
import { QuoteService } from "../src/modules/booking/services/quote.service";
import { quoteHash, quoteInput } from "../src/modules/booking/utils/quote-input";

const trip = {
  vehicleCount: 1,
  address: {
    pickup: { address: "JFK Airport" },
    dropoff: { address: "Times Square" },
    distance: 18,
    duration: 40,
  },
  bookingTime: { pickupDate: "2030-09-11", pickupTime: "14:00" },
};
const checkout = Object.assign({}, trip, {
  vehicleCategoryId: "sedan",
  quoteId: "quote-1",
  passenger: { passengerCount: 1, name: "Ada", phone: "+17322898928", email: "ada@example.com" },
}) as never;

const tripPricing = {
  rates: {
    fuelSurchargeRate: 0,
    gratuityRate: 0,
    taxRate: 0,
    transactionFeeRate: 0,
    oneWayDiscountRate: 0,
    returnDiscountRate: 0,
    airportPickupFee: 0,
    stopFee: 0,
    meetAndGreetFee: 0,
  },
  isAirport: true,
  isReturn: false,
  stopsCount: 0,
  meetAndGreetOneWay: false,
  meetAndGreetReturn: false,
  extraServicesPrice: 0,
};

const vehicle = (id: string, basePrice: number) => ({
  id,
  name: id,
  description: null,
  image: null,
  passengerCount: 4,
  luggageCount: 3,
  basePrice,
});

function setup(options: { currentTotal?: number } = {}) {
  const bookingService = {
    tripPricing: jest.fn(async () => tripPricing),
    priceForCustomer: jest.fn(async () => ({ total: options.currentTotal ?? 100 })),
  };
  const quoteRepository = {
    create: jest.fn(async (data: { vehicleCategoryId: string; expiresAt: Date }) => ({
      id: `quote-${data.vehicleCategoryId}`,
      expiresAt: data.expiresAt,
    })),
    findById: jest.fn(),
  };
  const vehiclePricing = {
    pricedForDistance: jest.fn(async () => [vehicle("sedan", 100), vehicle("suv", 150)]),
  };
  const service = new QuoteService(
    bookingService as never,
    quoteRepository as never,
    vehiclePricing as never,
    { get: () => "test" } as never,
    { error: jest.fn() } as never,
  );
  return { service, bookingService, quoteRepository, vehiclePricing };
}

const storedQuote = (overrides: Record<string, unknown> = {}) =>
  Object.assign(
    {
      id: "quote-1",
      vehicleCategoryId: "sedan",
      inputHash: quoteHash(quoteInput(checkout)),
      pricing: { total: 100, saved: true },
      total: new Prisma.Decimal(100),
      expiresAt: new Date(Date.now() + 60_000),
      booking: null,
      checkoutUrl: null,
    },
    overrides,
  ) as never;

describe("QuoteService.estimate", () => {
  it("prices every vehicle on the server without saving anything", async () => {
    const { service, quoteRepository, vehiclePricing, bookingService } = setup();

    const options = await service.estimate(trip as never);

    expect(vehiclePricing.pricedForDistance).toHaveBeenCalledWith(18);
    expect(bookingService.tripPricing).toHaveBeenCalledWith(trip, false);
    expect(options.map((option) => [option.vehicleCategory.id, option.total])).toEqual([
      ["sedan", 100],
      ["suv", 150],
    ]);
    expect(quoteRepository.create).not.toHaveBeenCalled();
  });
});

describe("QuoteService.create", () => {
  it("saves the chosen vehicle's price with the trip it was priced for", async () => {
    const { service, quoteRepository, bookingService } = setup();

    const quote = await service.create(Object.assign({ vehicleCategoryId: "suv" }, trip) as never);

    expect(bookingService.tripPricing).toHaveBeenCalledWith(expect.anything(), true);
    expect(quoteRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        vehicleCategoryId: "suv",
        total: 150,
        inputHash: quoteHash(quoteInput(trip as never)),
      }),
    );
    expect(quote).toEqual(expect.objectContaining({ id: "quote-suv", total: 150 }));
  });

  it("refuses a vehicle that does not serve the trip distance", async () => {
    const { service } = setup();

    await expect(
      service.create(Object.assign({ vehicleCategoryId: "limo" }, trip) as never),
    ).rejects.toThrow("not available for the trip distance");
  });
});

describe("QuoteService.find", () => {
  it("refuses an unknown quote or one for another vehicle", async () => {
    const { service, quoteRepository } = setup();
    quoteRepository.findById.mockResolvedValueOnce(null);
    await expect(service.find(checkout)).rejects.toThrow(ConflictException);

    quoteRepository.findById.mockResolvedValueOnce(storedQuote({ vehicleCategoryId: "suv" }));
    await expect(service.find(checkout)).rejects.toThrow("no longer available");
  });
});

describe("QuoteService.pricingFor", () => {
  it("charges the saved price while the quote is valid, even if rates changed", async () => {
    const { service } = setup({ currentTotal: 120 });

    await expect(service.pricingFor(storedQuote(), checkout)).resolves.toEqual({
      total: 100,
      saved: true,
    });
  });

  it("honours an expired quote when the price has not changed", async () => {
    const { service } = setup({ currentTotal: 100 });

    await expect(
      service.pricingFor(storedQuote({ expiresAt: new Date(Date.now() - 1) }), checkout),
    ).resolves.toEqual({ total: 100 });
  });

  it("returns a new quote to confirm when an expired price changed", async () => {
    const { service } = setup({ currentTotal: 120 });

    const error = await service
      .pricingFor(storedQuote({ expiresAt: new Date(Date.now() - 1) }), checkout)
      .catch((caught: ConflictException) => caught);

    expect(error).toBeInstanceOf(ConflictException);
    expect((error as ConflictException).getResponse()).toEqual(
      expect.objectContaining({
        error: "PRICE_CHANGED",
        details: { quote: expect.objectContaining({ id: "quote-sedan", total: 100 }) },
      }),
    );
  });

  it("re-prices when the trip no longer matches what was quoted", async () => {
    const { service } = setup();

    await expect(service.pricingFor(storedQuote({ inputHash: "other" }), checkout)).rejects.toThrow(
      "Your trip changed since it was priced",
    );
  });
});

describe("quoteInput", () => {
  it("gives the same hash whatever order the extras arrive in", () => {
    const extras = [
      { extraServiceId: "b", quantity: 1 },
      { extraServiceId: "a", quantity: 2 },
    ];
    const first = quoteInput(Object.assign({ extraServices: extras }, trip) as never);
    const second = quoteInput(
      Object.assign({ extraServices: extras.slice().reverse() }, trip) as never,
    );

    expect(quoteHash(first)).toBe(quoteHash(second));
  });

  it("ignores return details on a one-way trip", () => {
    const oneWay = quoteInput(trip as never);
    const withReturnTime = quoteInput(
      Object.assign({}, trip, {
        bookingType: BookingType.ONE_WAY,
        bookingTime: Object.assign(
          { returnDate: "2030-09-12", returnTime: "10:00" },
          trip.bookingTime,
        ),
      }) as never,
    );

    expect(quoteHash(oneWay)).toBe(quoteHash(withReturnTime));
  });
});
