export type PricedVehicle = {
  id: string;
  name: string;
  models: string | null;
  description: string | null;
  image: string | null;
  passengerCount: number;
  luggageCount: number;
  basePrice: number;
};

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
