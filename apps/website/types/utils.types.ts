import type { HourCycle } from "@usa-limousine-corporation/ui/store/time-format";
export type LocationFieldName = "pickupAddress" | "deliveryAddress";

export interface LocationFormAccessor {
    getValues: (name: LocationFieldName) => string;
    setValue: (
        name: LocationFieldName,
        value: string,
        options?: { shouldDirty?: boolean; shouldValidate?: boolean }
    ) => void;
}

export interface ReverseGeocodeParams {
    lat: number;
    lng: number;
}

export interface CalculateArrivalTimeParams {
    time?: string;
    durationMinutes?: number;
    hourCycle?: HourCycle;
}

export interface ValidateBookingTimeParams {
    date: string;
    time: string;
    minBookingMinutes: number;
}
