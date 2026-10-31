import { BookingPricingService } from "../src/modules/booking/services/pricing.service";
import type { PlatformRates } from "../src/modules/platform-settings/types/platform-settings";

const rates: PlatformRates = {
  paymentMode: "TEST",
  fuelSurchargeRate: 5,
  gratuityRate: 15,
  taxRate: 8,
  transactionFeeRate: 3,
  oneWayDiscountRate: 10,
  returnDiscountRate: 20,
  airportPickupFee: 12,
  stopFee: 10,
  meetAndGreetFee: 25,
  emailNotificationFee: 0,
  smsNotificationFee: 1.49,
  minBookingNotice: 2,
  minBookingNoticeUnit: "HOUR",
  minBookingMinutes: 120,
  cancellationNotice: 2,
  cancellationNoticeUnit: "HOUR",
  cancellationMinutes: 120,
  cancellationRefundRate: 100,
};

const pricing = new BookingPricingService({} as never, {} as never, {} as never, {} as never);

type TotalsInput = {
  basePrice: number;
  vehicleCount: number;
  rates: PlatformRates;
  isAirport: boolean;
  isReturn: boolean;
  stopsCount: number;
  meetAndGreetOneWay: boolean;
  meetAndGreetReturn: boolean;
  extraServicesPrice: number;
  notificationsPrice: number;
  items: [];
};

const totals = (input: Omit<TotalsInput, "vehicleCount" | "items"> & { vehicleCount?: number }) =>
  (
    pricing as unknown as {
      totals: (value: TotalsInput) => ReturnType<BookingPricingService["calculatePrice"]>;
    }
  ).totals({
    vehicleCount: input.vehicleCount ?? 1,
    items: [],
    ...input,
  });

const oneWayInput = {
  basePrice: 100,
  rates,
  isAirport: false,
  isReturn: false,
  stopsCount: 0,
  meetAndGreetOneWay: false,
  meetAndGreetReturn: false,
  extraServicesPrice: 0,
  notificationsPrice: 0,
};

describe("BookingPricingService totals", () => {
  it("prices fees on the base, discount on the subtotal, then the airport fee", () => {
    const result = totals({
      ...oneWayInput,
      isAirport: true,
    });

    expect(result).toEqual(
      expect.objectContaining({
        basePrice: 100,
        fuelSurchargePrice: 5,
        gratuityPrice: 15,
        taxPrice: 8,
        transactionFeePrice: 3,
        discountPrice: 13.1,
        airportPickupPrice: 12,
        total: 129.9,
      }),
    );
  });

  it("skips the airport fee away from airports", () => {
    expect(totals(oneWayInput).airportPickupPrice).toBe(0);
  });

  it("uses the one-way discount outbound and the return discount on the way back", () => {
    const result = totals({
      ...oneWayInput,
      isReturn: true,
    });

    expect(result.legs?.oneWay.total).toBe(117.9);
    expect(result.legs?.returnTrip.total).toBe(104.8);
    expect(result.taxPrice).toBe(16);
  });

  it("adds the chosen notification fees to the total", () => {
    const result = totals({
      ...oneWayInput,
      notificationsPrice: 1.49,
    });

    expect(result.notificationsPrice).toBe(1.49);
    expect(result.total).toBe(117.9 + 1.49);
  });

  it("adds stops, meet & greet per leg and extras to a return booking", () => {
    const result = totals({
      basePrice: 100,
      rates,
      isAirport: false,
      isReturn: true,
      stopsCount: 2,
      meetAndGreetOneWay: true,
      meetAndGreetReturn: true,
      extraServicesPrice: 15,
      notificationsPrice: 0,
    });

    expect(result.basePrice).toBe(200);
    expect(result.discountPrice).toBe(39.3);
    expect(result.stopsPrice).toBe(20);
    expect(result.meetAndGreetPrice).toBe(50);
    expect(result.total).toBe(117.9 + 104.8 + 20 + 50 + 15);
    expect(result.rates.taxRate).toBe(8);
    expect(result.legs?.oneWay).toEqual(
      expect.objectContaining({ basePrice: 100, discountPrice: 13.1, total: 117.9 }),
    );
    expect(result.legs?.returnTrip).toEqual(
      expect.objectContaining({
        basePrice: 100,
        discountPrice: 26.2,
        meetAndGreetPrice: 25,
        total: 104.8,
      }),
    );
  });

  it("stores leg amounts for every booked vehicle and none on one-way trips", () => {
    const input = {
      basePrice: 100,
      rates,
      isAirport: false,
      vehicleCount: 2,
      stopsCount: 0,
      meetAndGreetOneWay: false,
      meetAndGreetReturn: false,
      extraServicesPrice: 0,
      notificationsPrice: 0,
    };

    expect(totals({ ...input, isReturn: true }).legs?.returnTrip.total).toBe(209.6);
    expect(totals({ ...input, isReturn: false }).legs).toBeUndefined();
  });
});
