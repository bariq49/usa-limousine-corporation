export type Payload = {
  tripId: string;
  driverId: string;
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
  timestamp: number;
};

export type Rooms = {
  tripId: string;
  driverId: string;
  customerUserId: string | null;
};

/** Customer REST poll / map cold-start (aligned with WS `driver.location`). */
export type CustomerLocation = {
  tripId: string;
  driverId: string;
  lat: number | null;
  lng: number | null;
  heading: number | null;
  speed: number | null;
  accuracy: number | null;
  timestamp: number | null;
  stale: boolean;
};
