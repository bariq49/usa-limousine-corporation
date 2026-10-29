import { roundAmount } from "../../../common/utils/money";

export type PricedVehicle = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  passengerCount: number;
  luggageCount: number;
  basePrice: number;
};

export type HourlyPriceInput = {
  basePrice: number;
  includedDistance: number;
  extraDistanceRate: number;
};

export function hourlyPrice(pricing: HourlyPriceInput, distance: number): number {
  const overage = Math.max(0, distance - pricing.includedDistance);
  return roundAmount(pricing.basePrice + overage * pricing.extraDistanceRate);
}

export const pricingInclude = {
  vehicleCategory: {
    select: {
      id: true,
      name: true,
      image: true,
      passengerCount: true,
    },
  },
} as const;

export type FindOverlappingParams = {
  vehicleCategoryId: string;
  minimumDistance: number;
  maximumDistance: number | null;
  excludeId?: string | undefined;
};
