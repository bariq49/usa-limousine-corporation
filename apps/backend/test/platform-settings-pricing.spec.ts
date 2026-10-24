import {
  bookingPricing,
  priceBreakdown,
  quoteLeg,
} from "../src/modules/platform-settings/utils/pricing";
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
  minBookingNotice: 2,
  minBookingNoticeUnit: "HOUR",
  minBookingMinutes: 120,
};

describe("platform pricing", () => {
  it("prices a leg: fees on the base, discount on the subtotal, then the airport fee", () => {
    const leg = quoteLeg(100, rates.oneWayDiscountRate, rates, true);

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
    expect(quoteLeg(100, 0, rates, false).airportFeeAmount).toBe(0);
  });

  it("uses the one-way discount outbound and the return discount on the way back", () => {
    const breakdown = priceBreakdown(100, rates, false);

    expect(breakdown.oneWayTotalPrice).toBe(117.9);
    expect(breakdown.returnTotalPrice).toBe(104.8);
    expect(breakdown.oneWayTaxAmount).toBe(8);
  });

  it("adds stops, meet & greet per leg and extras to a return booking", () => {
    const pricing = bookingPricing({
      basePrice: 100,
      rates,
      isAirport: false,
      isReturn: true,
      stopsCount: 2,
      meetAndGreetLegs: 2,
      extraServicesPrice: 15,
    });

    expect(pricing.basePrice).toBe(200);
    expect(pricing.discountPrice).toBe(39.3);
    expect(pricing.stopsPrice).toBe(20);
    expect(pricing.meetAndGreetPrice).toBe(50);
    expect(pricing.total).toBe(117.9 + 104.8 + 20 + 50 + 15);
    expect(pricing.rates.taxRate).toBe(8);
  });
});
