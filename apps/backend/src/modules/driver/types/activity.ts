export type GroupBy = "day" | "month" | "year";

export type SeriesBucket = {
  key: string;
  label: string;
  finished: number;
  incoming: number;
};

export type ReasonCount = {
  count: number;
  percent: number;
};

export type Filter = {
  startDate?: string;
  endDate?: string;
  year?: number;
  month?: number;
  day?: string;
  groupBy?: GroupBy;
};

export type Activity = {
  timezone: string;
  groupBy: GroupBy;
  startDate: string;
  endDate: string;
  acceptanceRate: number;
  finishedRides: number;
  incomingRequests: number;
  series: SeriesBucket[];
  cancelReasons: {
    total: number;
    youCancelled: ReasonCount;
    youDidNotAccept: ReasonCount;
    clientCancelled: ReasonCount;
    clientNoShow: ReasonCount;
  };
};
