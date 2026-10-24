import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { addMinutes, parse, format, isValid, parseISO } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { loadGoogleMaps } from "@usa-limousine-corporation/ui/bookings/google-maps-loader";
import { isAirportAddress } from "@usa-limousine-corporation/ui/utils/places";
import { CURRENCY_SYMBOL, DEFAULT_TIMEZONE, DISTANCE_UNIT } from "@/constants/app-default";
import { TRIP_TYPES } from "@/constants/booking-constants";
import type { LocationFormAccessor, AddressInfo, ReverseGeocodeParams, CalculateArrivalTimeParams, ValidateBookingTimeParams } from "@/types/utils.types";
import type { TripType } from "@/types/booking.types";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatPrice(value: number | undefined | null): string {
    const numericValue = Number(value ?? 0);
    const safeValue = Number.isFinite(numericValue) ? numericValue : 0;
    const roundedValue = Math.round(safeValue * 100) / 100;
    const formatted = Number.isInteger(roundedValue)
        ? String(roundedValue)
        : roundedValue.toFixed(2);
    return `${CURRENCY_SYMBOL}${formatted}`;
}

export function formatDate(dateStr: string | undefined): string {
    if (!dateStr) return "—";
    try {
        const isoDate = parseISO(dateStr);
        if (isValid(isoDate)) return format(isoDate, "MM/dd/yyyy");
        const fallbackDate = parse(dateStr, "yyyy-MM-dd", new Date());
        if (isValid(fallbackDate)) return format(fallbackDate, "MM/dd/yyyy");
        return dateStr;
    } catch {
        return dateStr || "—";
    }
}

export function formatDistance(distance: number | undefined | null): string | null {
    if (!distance) return null;
    return `${distance.toFixed(1)} ${DISTANCE_UNIT}`;
}

export const formatExtraDistanceRate = (rate: number) =>
    `${formatPrice(rate)} / ${DISTANCE_UNIT}`;

const isPlusCodeAddress = (address: string) => /^[A-Z0-9]{4,}\+[A-Z0-9]{2,}/i.test(address.trim());

const getBestGeocodedAddress = (results: google.maps.GeocoderResult[] | null | undefined) => {
    if (!results?.length) return null;

    const preferredTypes = [
        "street_address",
        "premise",
        "subpremise",
        "route",
        "intersection",
        "establishment",
    ];

    const nonPlusCodeResults = results.filter(
        (result) => result.formatted_address && !isPlusCodeAddress(result.formatted_address)
    );

    const preferredResult = nonPlusCodeResults.find((result) =>
        result.types?.some((type) => preferredTypes.includes(type))
    );

    return preferredResult?.formatted_address ?? nonPlusCodeResults[0]?.formatted_address ?? null;
};

export const swapPickupAndDelivery = (form: LocationFormAccessor): void => {
    const pickupAddress = form.getValues("pickupAddress");
    const deliveryAddress = form.getValues("deliveryAddress");

    form.setValue("pickupAddress", deliveryAddress, { shouldDirty: true });
    form.setValue("deliveryAddress", pickupAddress, { shouldDirty: true });
};

const reverseGeocodeWithGoogle = async ({ lat, lng }: ReverseGeocodeParams): Promise<string | null> => {
    await loadGoogleMaps();

    if (!window.google?.maps?.Geocoder) return null;

    return new Promise((resolve) => {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === "OK") {
                resolve(getBestGeocodedAddress(results));
                return;
            }
            resolve(null);
        });
    });
};

const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by this browser."));
            return;
        }

        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
        });
    });
};

export const getCurrentLocationErrorMessage = (error: GeolocationPositionError): string => {
    if (error.code === error.PERMISSION_DENIED) {
        return "Location permission denied. Please allow access and try again.";
    }
    return "Could not get your current location.";
};

export const isGeolocationError = (error: unknown): error is GeolocationPositionError => {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof (error as { code: unknown }).code === "number"
    );
};

export const getPickupLocation = async (): Promise<string> => {
    const position = await getCurrentPosition();
    const { latitude, longitude } = position.coords;
    const geocodedAddress = await reverseGeocodeWithGoogle({ lat: latitude, lng: longitude });

    return geocodedAddress ?? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
};


export const isAirportPickupRequired = (
    pickupAddress: string,
    deliveryAddress?: string,
): boolean => {
    return (
        isAirportAddress(pickupAddress) ||
        isAirportAddress(deliveryAddress ?? "")
    );
};


export function formatDuration(durationMinutes: number | undefined | null): string | null {
    if (typeof durationMinutes === "number" && durationMinutes > 0) {
        const hrs = Math.floor(durationMinutes / 60);
        const mins = durationMinutes % 60;
        return hrs > 0 ? `${hrs} h ${mins} mins` : `${mins} mins`;
    }
    return null;
}

export const formatHrs = (hours: number) =>
  `${hours} ${hours === 1 ? "hr" : "hrs"}`;

/** Service label shown on the booking summary, derived from the route. */
export const resolveServiceType = (isAirportSelected: boolean) =>
  isAirportSelected ? "Airport Transfer" : "Point-to-Point";

export const formatTripType = (tripType?: string) =>
  (tripType || TRIP_TYPES.ONE_WAY).replace(/-/g, " ");

export function parseAddress(address: string | undefined | null): AddressInfo {
    if (!address) return { name: "", detail: "" };
    const parts = address.split(",");
    if (parts.length > 1) {
        return {
            name: parts[0].trim(),
            detail: parts.slice(1).join(",").trim(),
        };
    }
    return { name: address, detail: "" };
}

export function calculateArrivalTime({ time, durationMinutes }: CalculateArrivalTimeParams): string {
    if (!time || typeof durationMinutes !== "number") return "—";
    try {
        let date = parse(time, "hh:mm a", new Date());
        if (!isValid(date)) {
            date = parse(time, "HH:mm", new Date());
        }
        if (!isValid(date)) return "—";

        const arrivalDate = addMinutes(date, durationMinutes);
        return format(arrivalDate, "hh:mm a");
    } catch {
        return "—";
    }
}

export const validateBookingTime = ({
    date,
    time,
    minBookingMinutes,
}: ValidateBookingTimeParams): { isValid: boolean; timeDisplay?: string } => {
    if (!date || !time || !minBookingMinutes) return { isValid: true };

    try {
        const pickupDateTime = fromZonedTime(`${date} ${time}`, DEFAULT_TIMEZONE);
        const now = new Date();
        const minNoticeMs = minBookingMinutes * 60 * 1000;

        if (pickupDateTime.getTime() - now.getTime() < minNoticeMs) {
            const hours = minBookingMinutes / 60;
            const timeDisplay = hours >= 1
                ? `${hours % 1 === 0 ? hours : hours.toFixed(1)} hours`
                : `${minBookingMinutes} minutes`;

            return { isValid: false, timeDisplay };
        }

        return { isValid: true };
    } catch {
        return { isValid: true };
    }
};