import { z } from "zod";
import type { GroupBy, Params } from "@/lib/types/drivers";

export const ALL_MONTH = "all";
export const AUTO_GROUP = "auto";

export const MODES = ["year", "month", "day", "range"] as const;
export type Mode = (typeof MODES)[number];

export const GROUP_VALUES = ["auto", "day", "month", "year"] as const;
export type GroupValue = (typeof GROUP_VALUES)[number];

export const schema = z.object({
  mode: z.enum(MODES),
  year: z.string(),
  month: z.string(),
  day: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  groupBy: z.enum(GROUP_VALUES),
});

export type Values = z.infer<typeof schema>;

export function currentYear() {
  return new Date().getFullYear();
}

export function defaults(): Values {
  return {
    mode: "year",
    year: String(currentYear()),
    month: ALL_MONTH,
    day: "",
    startDate: "",
    endDate: "",
    groupBy: AUTO_GROUP,
  };
}

/** Group-by choices allowed for the current period mode. Empty = hide the field. */
export function groupOptionsForMode(
  mode: Mode,
  month: string = ALL_MONTH,
): { value: GroupValue; label: string }[] {
  const auto = { value: AUTO_GROUP as GroupValue, label: "Auto" };
  const byDay = { value: "day" as GroupValue, label: "By day" };
  const byMonth = { value: "month" as GroupValue, label: "By month" };
  const byYear = { value: "year" as GroupValue, label: "By year" };

  switch (mode) {
    case "day":
      return [];
    case "month":
      if (month !== ALL_MONTH) {
        return [auto, byDay];
      }
      return [auto, byMonth, byDay];
    case "year":
      return [auto, byMonth, byDay];
    case "range":
      return [auto, byDay, byMonth, byYear];
    default:
      return [auto];
  }
}

export function toQuery(values: Values): Params {
  const year = values.year.trim();
  const month = values.month === ALL_MONTH ? "" : values.month.trim();
  const day = values.day.trim();
  const startDate = values.startDate.trim();
  const endDate = values.endDate.trim();
  const allowed = groupOptionsForMode(values.mode, values.month).map((o) => o.value);
  const groupBy =
    values.groupBy !== AUTO_GROUP && allowed.includes(values.groupBy)
      ? (values.groupBy as GroupBy)
      : undefined;

  const next: Params = {};

  switch (values.mode) {
    case "day":
      if (day) {
        next.day = day;
      } else {
        next.year = currentYear();
      }
      break;
    case "month":
      if (month) {
        next.month = Number(month);
      }
      next.year = year ? Number(year) : currentYear();
      break;
    case "range":
      if (startDate) {
        next.startDate = startDate;
      }
      if (endDate) {
        next.endDate = endDate;
      }
      if (!startDate && !endDate) {
        next.year = currentYear();
      }
      break;
    case "year":
    default:
      next.year = year ? Number(year) : currentYear();
      break;
  }

  if (groupBy) {
    next.groupBy = groupBy;
  }

  return next;
}
