import { AIRPORT_KEYWORDS, HOTEL_KEYWORDS, TRAIN_KEYWORDS } from "../constants/places";

export function isAirportAddress(address: string): boolean {
  if (!address) return false;
  const lowerAddress = address.toLowerCase();
  return AIRPORT_KEYWORDS.some((keyword) => lowerAddress.includes(keyword));
}

export function isTrainAddress(address: string): boolean {
  if (!address) return false;
  const lowerAddress = address.toLowerCase();
  return TRAIN_KEYWORDS.some((keyword) => lowerAddress.includes(keyword));
}

export function isHotelAddress(address: string): boolean {
  if (!address) return false;
  const lowerAddress = address.toLowerCase();
  return HOTEL_KEYWORDS.some((keyword) => lowerAddress.includes(keyword));
}
