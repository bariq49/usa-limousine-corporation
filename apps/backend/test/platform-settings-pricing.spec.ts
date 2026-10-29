import { BookingPricingService } from "../src/modules/booking/services/booking-pricing.service";
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

describe("BookingPricingService totals", () => {
  it("prices a leg: fees on the base, discount on the subtotal, then the airport fee", () => {
    const leg = pricing.quoteLeg(100, rates.oneWayDiscountRate, rates, true);

    expect(leg).toEqual({
      basePrice: 100,
      fuelSurchargeAmount: 5,
      gratuityAmount: 15,
      taxAmount: 8,
      transactionFeeAmount: 3,
      priceBeforeDiscount: 131,
      discountRate: 10,
      discountAmount: 13.1,
      airportFeeAmount: 12,
      total: 129.9,
    });
  });

  it("skips the airport fee away from airports", () => {
    expect(pricing.quoteLeg(100, 0, rates, false).airportFeeAmount).toBe(0);
  });

  it("uses the one-way discount outbound and the return discount on the way back", () => {
    const outbound = pricing.quoteLeg(100, rates.oneWayDiscountRate, rates, false);
    const back = pricing.quoteLeg(100, rates.returnDiscountRate, rates, false);

    expect(outbound.total).toBe(117.9);
    expect(back.total).toBe(104.8);
    expect(outbound.taxAmount).toBe(8);
  });

  it("adds the chosen notification fees to the total", () => {
    const result = pricing.bookingPricing({
      basePrice: 100,
      rates,
      isAirport: false,
      isReturn: false,
      stopsCount: 0,
      meetAndGreetOneWay: false,
      meetAndGreetReturn: false,
      extraServicesPrice: 0,
      notificationsPrice: 1.49,
    });

    expect(result.notificationsPrice).toBe(1.49);
    expect(result.total).toBe(117.9 + 1.49);
  });

  it("adds stops, meet & greet per leg and extras to a return booking", () => {
    const result = pricing.bookingPricing({
      basePrice: 100,
      rates,
      isAirport: false,
      isReturn: true,
      stopsCount: 2,
      meetAndGreetOneWay: true,
      meetAndGreetReturn: true,
      extraServicesPrice: 15,
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
    };

    expect(
      pricing.bookingPricing(Object.assign({ isReturn: true }, input)).legs?.returnTrip.total,
    ).toBe(209.6);
    expect(pricing.bookingPricing(Object.assign({ isReturn: false }, input)).legs).toBeUndefined();
  });
});
