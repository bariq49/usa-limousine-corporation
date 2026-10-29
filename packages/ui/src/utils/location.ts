import { loadGoogleMaps } from "../bookings/google-maps-loader";
import type {
  AirportPickupRequiredProps,
  LocationFormAccessor,
  ReverseGeocodeParams,
} from "../types/location";
import { isAirportAddress } from "./places";

function isPlusCodeAddress(address: string) {
  return /^[A-Z0-9]{4,}\+[A-Z0-9]{2,}/i.test(address.trim());
}

function getBestGeocodedAddress(
  results: google.maps.GeocoderResult[] | null | undefined,
): string | null {
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
    (result) => result.formatted_address && !isPlusCodeAddress(result.formatted_address),
  );

  const preferredResult = nonPlusCodeResults.find((result) =>
    result.types?.some((type) => preferredTypes.includes(type)),
  );

  return preferredResult?.formatted_address ?? nonPlusCodeResults[0]?.formatted_address ?? null;
}

export function swapPickupAndDelivery(props: { form: LocationFormAccessor }): void {
  const { form } = props;
  const pickupAddress = form.getValues("pickupAddress");
  const deliveryAddress = form.getValues("deliveryAddress");

  form.setValue("pickupAddress", deliveryAddress, { shouldDirty: true });
  form.setValue("deliveryAddress", pickupAddress, { shouldDirty: true });
}

async function reverseGeocodeWithGoogle(
  props: ReverseGeocodeParams,
): Promise<string | null> {
  await loadGoogleMaps();

  if (!window.google?.maps?.Geocoder) return null;

  return new Promise((resolve) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat: props.lat, lng: props.lng } }, (results, status) => {
      if (status === "OK") {
        resolve(getBestGeocodedAddress(results));
        return;
      }
      resolve(null);
    });
  });
}

function getCurrentPosition(): Promise<GeolocationPosition> {
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
}

export function getCurrentLocationErrorMessage(props: {
  error: GeolocationPositionError;
}): string {
  if (props.error.code === props.error.PERMISSION_DENIED) {
    return "Location permission denied. Please allow access and try again.";
  }
  return "Could not get your current location.";
}

export function isGeolocationError(error: unknown): error is GeolocationPositionError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "number"
  );
}

export async function getPickupLocation(): Promise<string> {
  const position = await getCurrentPosition();
  const { latitude, longitude } = position.coords;
  const geocodedAddress = await reverseGeocodeWithGoogle({ lat: latitude, lng: longitude });

  return geocodedAddress ?? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
}

export function isAirportPickupRequired(props: AirportPickupRequiredProps): boolean {
  return (
    isAirportAddress(props.pickupAddress) || isAirportAddress(props.deliveryAddress ?? "")
  );
}
