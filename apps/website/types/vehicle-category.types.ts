export type CategoryPriceBreakdown = {
  oneWayBasePrice?: number;
  oneWaySurchargePercentage?: number;
  oneWaySurchargeAmount?: number;
  oneWayGratuityPercentage?: number;
  oneWayGratuityAmount?: number;
  oneWayTaxPercentage?: number;
  oneWayTaxAmount?: number;
  oneWayTransactionFeePercentage?: number;
  oneWayTransactionFeeAmount?: number;
  oneWayDiscountPercentage?: number;
  oneWayDiscountAmount?: number;
  oneWayAirportFeeAmount?: number;
  oneWayPriceBeforeDiscount?: number;
  oneWayTotalPrice: number;
  returnBasePrice?: number;
  returnSurchargePercentage?: number;
  returnSurchargeAmount?: number;
  returnGratuityPercentage?: number;
  returnGratuityAmount?: number;
  returnTaxPercentage?: number;
  returnTaxAmount?: number;
  returnTransactionFeePercentage?: number;
  returnTransactionFeeAmount?: number;
  returnDiscountPercentage?: number;
  returnDiscountAmount?: number;
  returnAirportFeeAmount?: number;
  returnPriceBeforeDiscount?: number;
  returnTotalPrice?: number;
};

/** Vehicle category from the public API (`/public/vehicle-categories...`). */
export type VehicleCategory = {
  id: string;
  name: string;
  description?: string | null;
  /** Null when the category has no uploaded image. */
  image?: string | null;
  passengerCount: number;
  /** Total bags the vehicle carries. */
  luggageCount: number;
  /** Prices for the trip distance; hourly results have none and are quoted on request. */
  priceBreakdown?: CategoryPriceBreakdown;
};

export type ByDistanceParams = {
  distance: number;
  isAirport?: boolean;
  enabled?: boolean;
};

