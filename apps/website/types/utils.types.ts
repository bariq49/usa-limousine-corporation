export type LocationFieldName = "pickupAddress" | "deliveryAddress";

export interface LocationFormAccessor {
    getValues: (name: LocationFieldName) => string;
    setValue: (
        name: LocationFieldName,
        value: string,
        options?: { shouldDirty?: boolean; shouldValidate?: boolean }
    ) => void;
}

export interface AddressInfo {
    name: string;
    detail: string;
}

export interface ReverseGeocodeParams {
    lat: number;
    lng: number;
}

export interface CalculateArrivalTimeParams {
    time?: string;
    durationMinutes?: number;
}

export interface ValidateBookingTimeParams {
    date: string;
    time: string;
    minBookingMinutes: number;
}
