export type LocationFieldName = "pickupAddress" | "deliveryAddress";

export interface LocationFormAccessor {
  getValues: (name: LocationFieldName) => string;
  setValue: (
    name: LocationFieldName,
    value: string,
    options?: { shouldDirty?: boolean; shouldValidate?: boolean },
  ) => void;
}

export interface ReverseGeocodeParams {
  lat: number;
  lng: number;
}

export interface AirportPickupRequiredProps {
  pickupAddress: string;
  deliveryAddress?: string | undefined;
}
