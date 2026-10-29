import { ConflictException } from "@nestjs/common";
import { BookingType, Prisma } from "@prisma/client";
import { BookingPricingService } from "../src/modules/booking/services/booking-pricing.service";
import { QuoteService } from "../src/modules/booking/services/quote.service";
import { quoteHash, quoteInput } from "../src/modules/booking/utils/quote-input";

const totals = new BookingPricingService({} as never, {} as never, {} as never, {} as never);

const trip = {
  vehicleCount: 1,
  address: {
    pickup: { address: "JFK Airport" },
    dropoff: { address: "Times Square" },
    distance: 18,
    travelDuration: 40
  },
  bookingTime: { pickupDate: "2030-09-11", pickupTime: "14:00" },
};
const checkoutBody = () =>
  Object.assign({}, trip, {
    vehicleCategoryId: "sedan",
    quoteId: "quote-1",
    address: Object.assign({}, trip.address),
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
  notificationsPrice: 0,
  items: [],
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

function setup(options: { currentTotal?: number; liveDistance?: number } = {}) {
  const pricingService = {
    tripPricing: jest.fn(async (body: { address: { distance: number } }) => {
      if (options.liveDistance != null) {
        body.address.distance = options.liveDistance;
      }
      return tripPricing;
    }),
    priceForCustomer: jest.fn(async (body: { address: { distance: number } }) => {
      if (options.liveDistance != null) {
        body.address.distance = options.liveDistance;
      }
      return { total: options.currentTotal ?? 100 };
    }),
    bookingPricing: totals.bookingPricing.bind(totals),
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
    pricedForHours: jest.fn(async () => [vehicle("sedan", 240), vehicle("suv", 360)]),
  };
  const service = new QuoteService(
    pricingService as never,
    quoteRepository as never,
    vehiclePricing as never,
    { get: () => "test" } as never,
    { error: jest.fn() } as never,
  );
  return { service, bookingService: pricingService, quoteRepository, vehiclePricing };
}

const storedQuote = (overrides: Record<string, unknown> = {}) => {
  const input = quoteInput(checkoutBody());
  return Object.assign(
    {
      id: "quote-1",
      vehicleCategoryId: "sedan",
      inputHash: quoteHash(input),
      input,
      pricing: { total: 100, saved: true },
      total: new Prisma.Decimal(100),
      expiresAt: new Date(Date.now() + 60_000),
      booking: null,
      checkoutUrl: null,
    },
    overrides,
  ) as never;
};

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

  it("prices hourly hire by hours instead of distance", async () => {
    const { service, vehiclePricing } = setup();
    const hourly = Object.assign({}, trip, {
      bookingType: BookingType.HOURLY,
      hourlyDuration: 3,
      address: Object.assign({}, trip.address, { distance: 0, dropoff: undefined }),
    });

    const options = await service.estimate(hourly as never);

    expect(vehiclePricing.pricedForHours).toHaveBeenCalledWith(3, 0);
    expect(vehiclePricing.pricedForDistance).not.toHaveBeenCalled();
    expect(options.map((option) => [option.vehicleCategory.id, option.total])).toEqual([
      ["sedan", 240],
      ["suv", 360],
    ]);
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

  it("saves an hourly quote priced from the matching hourly rate", async () => {
    const { service, quoteRepository, vehiclePricing } = setup();
    const hourly = Object.assign({}, trip, {
      bookingType: BookingType.HOURLY,
      hourlyDuration: 4,
      vehicleCategoryId: "sedan",
    });

    const quote = await service.create(hourly as never);

    expect(vehiclePricing.pricedForHours).toHaveBeenCalledWith(4, hourly.address.distance);
    expect(quoteRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        vehicleCategoryId: "sedan",
        total: 240,
        inputHash: quoteHash(quoteInput(hourly as never)),
      }),
    );
    expect(quote.total).toBe(240);
  });
});

describe("QuoteService.find", () => {
  it("refuses an unknown quote or one for another vehicle", async () => {
    const { service, quoteRepository } = setup();
    quoteRepository.findById.mockResolvedValueOnce(null);
    await expect(service.find(checkoutBody())).rejects.toThrow(ConflictException);

    quoteRepository.findById.mockResolvedValueOnce(storedQuote({ vehicleCategoryId: "suv" }));
    await expect(service.find(checkoutBody())).rejects.toThrow("no longer available");
  });
});

describe("QuoteService.pricingFor", () => {
  it("charges the saved price while the quote is valid, even if rates changed", async () => {
    const { service } = setup({ currentTotal: 120 });

    await expect(service.pricingFor(storedQuote(), checkoutBody())).resolves.toEqual({
      total: 100,
      saved: true,
    });
  });

  it("honours an expired quote when the price has not changed", async () => {
    const { service } = setup({ currentTotal: 100 });

    await expect(
      service.pricingFor(storedQuote({ expiresAt: new Date(Date.now() - 1) }), checkoutBody()),
    ).resolves.toEqual({ total: 100 });
  });

  it("returns a new quote to confirm when an expired price changed", async () => {
    const { service } = setup({ currentTotal: 120 });

    const error = await service
      .pricingFor(storedQuote({ expiresAt: new Date(Date.now() - 1) }), checkoutBody())
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

    await expect(
      service.pricingFor(storedQuote({ inputHash: "other" }), checkoutBody()),
    ).rejects.toThrow("Your trip changed since it was priced");
  });

  it("returns PRICE_CHANGED when the server route drifts beyond tolerance", async () => {
    const { service } = setup({ liveDistance: 25 });

    const error = await service
      .pricingFor(storedQuote(), checkoutBody())
      .catch((caught: ConflictException) => caught);

    expect(error).toBeInstanceOf(ConflictException);
    expect((error as ConflictException).getResponse()).toEqual(
      expect.objectContaining({ error: "PRICE_CHANGED" }),
    );
  });

  it("keeps the locked quote when route drift stays within tolerance", async () => {
    const { service } = setup({ currentTotal: 120, liveDistance: 18.2 });

    await expect(service.pricingFor(storedQuote(), checkoutBody())).resolves.toEqual({
      total: 100,
      saved: true,
    });
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

  it("includes hire hours on hourly quotes", () => {
    const input = quoteInput(
      Object.assign({}, trip, {
        bookingType: BookingType.HOURLY,
        hourlyDuration: 5,
      }) as never,
    );
    expect(input.hourlyDuration).toBe(5);
    expect(input.bookingType).toBe(BookingType.HOURLY);
  });
});
