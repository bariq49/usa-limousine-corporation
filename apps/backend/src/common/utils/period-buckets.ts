import { formatDate } from "./format-date";

export const STATS_PERIODS = ["daily", "weekly", "monthly", "yearly"] as const;

export type StatsPeriod = (typeof STATS_PERIODS)[number];

export type StatsBucket = {
  label: string;
  start: string;
  end: string;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const isoDay = (date: Date) => date.toISOString().slice(0, 10);

const shiftDays = (date: Date, days: number) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days));

const dayLabel = (date: Date) => `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}`;

export function periodBuckets(period: StatsPeriod): StatsBucket[] {
  const today = new Date(`${formatDate({ as: "value" })}T00:00:00Z`);
  const year = today.getUTCFullYear();

  if (period === "daily") {
    return Array.from({ length: 7 }, (_, index) => {
      const start = shiftDays(today, index - 6);
      return { label: dayLabel(start), start: isoDay(start), end: isoDay(shiftDays(start, 1)) };
    });
  }

  if (period === "weekly") {
    const weekStart = shiftDays(today, -((today.getUTCDay() + 6) % 7));
    return Array.from({ length: 8 }, (_, index) => {
      const start = shiftDays(weekStart, (index - 7) * 7);
      return { label: dayLabel(start), start: isoDay(start), end: isoDay(shiftDays(start, 7)) };
    });
  }

  if (period === "yearly") {
    return Array.from({ length: 5 }, (_, index) => {
      const value = year - 4 + index;
      return { label: String(value), start: `${value}-01-01`, end: `${value + 1}-01-01` };
    });
  }

  return MONTHS.map((label, index) => ({
    label,
    start: isoDay(new Date(Date.UTC(year, index, 1))),
    end: isoDay(new Date(Date.UTC(year, index + 1, 1))),
  }));
}

export function bucketIndex(buckets: StatsBucket[], day: string) {
  return buckets.findIndex((bucket) => day >= bucket.start && day < bucket.end);
}
