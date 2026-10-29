import type { StatsPeriod } from "@/lib/types/drivers";

export const STATS_PERIODS: { value: StatsPeriod; label: string; description: string }[] = [
  { value: "daily", label: "Daily", description: "Last 7 days" },
  { value: "weekly", label: "Weekly", description: "Last 8 weeks" },
  { value: "monthly", label: "Monthly", description: "Monthly totals this year" },
  { value: "yearly", label: "Yearly", description: "Last 5 years" },
];
