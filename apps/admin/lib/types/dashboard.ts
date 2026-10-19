export type DummyDashboardOverview = {
  totalRevenue: number;
  completedBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  monthlyRevenue: number[];
  monthlyBookings: {
    completed: number[];
    confirmed: number[];
    pending: number[];
  };
};

export type StatKey = keyof Pick<
  DummyDashboardOverview,
  "totalRevenue" | "completedBookings" | "confirmedBookings" | "pendingBookings"
>;

export type StatCard = {
  key: StatKey;
  text: string;
  color: "primary" | "success" | "info" | "warning";
  chartColor: string;
  format: (value: number) => string;
};

export type StatCardWithTotal = {
  key: StatKey;
  text: string;
  color: "primary" | "success" | "info" | "warning";
  chartColor: string;
  format: (value: number) => string;
  total: string;
};
export const dummyDashboardOverview: DummyDashboardOverview = {
  totalRevenue: 906.91,
  completedBookings: 0,
  confirmedBookings: 26,
  pendingBookings: 4,
  monthlyRevenue: [0, 0, 0, 0, 0, 0, 0, 0, 900, 0, 0, 0],
  monthlyBookings: {
    completed: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    confirmed: [0, 0, 0, 0, 0, 0, 0, 0, 26, 0, 0, 0],
    pending: [0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0],
  },
};
