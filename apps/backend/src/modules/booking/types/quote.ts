export type StoredQuoteInput = {
  bookingType: string;
  vehicleCount: number;
  hourlyDuration: number | null;
  pickup: string;
  dropoff: string | null;
  stops: string[];
  distance: number;
  travelDuration: number | null;
  pickupDate: string;
  pickupTime: string;
  returnDate: string | null;
  returnTime: string | null;
  meetAndGreet: boolean;
  returnMeetAndGreet: boolean;
  extraServices: { id: string; quantity: number; returnQuantity: number }[];
  notifications: { email: boolean; sms: boolean } | null;
  luggage: { id: string; quantity: number }[];
};
