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

export type CategoryByDistance = {
  _id: string;
  name: string;
  /** Null when the category has no uploaded image. */
  image: string | null;
  description?: string;
  passengers: number;
  suitcases: number;
  timePeriod?: string;
  carType?: string;
  allowRequestQuote?: boolean;
  isChauffeur?: boolean;
  createdAt?: string;
  updatedAt?: string;
  extraDistanceRate?: number;
  includedDistance?: number;
  priceBreakdown: CategoryPriceBreakdown;
};

export type ByDistanceParams = {
  distance: number;
  isAirport?: boolean;
  enabled?: boolean;
};


export type ApiLuggageCapacity = {
  luggageTypeId: string;
  quantity: number;
  luggageType?: { id: string; name: string } | null;
};

/** Vehicle category as returned by the public catalog endpoints. */
export type ApiVehicleCategory = {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  passengerCount: number;
  luggageCapacity?: ApiLuggageCapacity[];
};

export type ApiPricedVehicleCategory = ApiVehicleCategory & {
  distance: number;
  /** Base fare for the distance. */
  price: number;
  /** One-way and return leg prices with platform fees applied. */
  priceBreakdown: CategoryPriceBreakdown;
};

export type ApiPaginated<T> = {
  data: T[];
  total: number;
};
