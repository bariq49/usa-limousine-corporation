export type TrackingDriver = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  rating: number;
  rideCount: number;
  avatarUrl: string | null;
};

export type TrackingVehicle = {
  id: string;
  label: string;
  make: string;
  model: string;
  color: string | null;
  plate: string;
  category: string | null;
};

export type TrackingDriverLocation = {
  latitude: number | null;
  longitude: number | null;
  heading: number | null;
  speed: number | null;
  accuracy: number | null;
  lastSeenAt: string | null;
  stale: boolean;
};

export type TrackingBooking = {
  id: string;
  bookingNumber: string;
  bookingType: string;
  status: string;
  pricing: unknown;
  address: unknown;
  passenger: unknown;
  bookingTime: unknown;
  vehicleCategory: { id: string; name: string } | null;
};

export type CustomerTracking = {
  id: string;
  bookingId: string;
  status: string;
  watchToken: string | null;
  etaMinutes: number | null;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  driver: TrackingDriver;
  vehicle: TrackingVehicle | null;
  driverLocation: TrackingDriverLocation;
  booking: TrackingBooking;
};
