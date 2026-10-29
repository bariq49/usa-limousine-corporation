export type RouteStop = {
  address: string;
  latitude?: number | null;
  longitude?: number | null;
};

export type ResolveRouteProps = {
  pickup: RouteStop;
  dropoff: RouteStop;
  stops?: RouteStop[];
};

export type RouteResult = {
  distance: number;
  travelDuration: number;
};
