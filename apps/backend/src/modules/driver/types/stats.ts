export type Stats = {
  todayEarnings: number;
  acceptedRides: number;
  cancelledRides: number;
  pendingRides: number;
};

export type StatsQuery = {
  driverId: string;
  start: Date;
  end: Date;
};
