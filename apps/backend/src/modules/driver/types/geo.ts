export type Nearby = {
  driverId: string;
  distance: number;
};

export type Upsert = {
  driverId: string;
  lat: number;
  lng: number;
  categoryId?: string | null;
};

export type Remove = {
  driverId: string;
  categoryId?: string | null;
};

export type SearchNearby = {
  lat: number;
  lng: number;
  radius: number;
  count: number;
  categoryId?: string;
};

export type Busy = {
  driverId: string;
};

export type FilterBusy = {
  driverIds: string[];
};
